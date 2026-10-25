const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to generate unique sequential invoice number
const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;
  
  // Count existing invoices for this year
  const count = await Invoice.countDocuments({
    invoiceNumber: { $regex: `^${prefix}` }
  });

  const nextSeq = 1001 + count;
  let candidate = `${prefix}${nextSeq}`;
  
  // Collision safeguard
  let existing = await Invoice.findOne({ invoiceNumber: candidate });
  let offset = 1;
  while (existing) {
    candidate = `${prefix}${nextSeq + offset}`;
    existing = await Invoice.findOne({ invoiceNumber: candidate });
    offset++;
  }
  return candidate;
};

// @desc    Get all invoices with optional search & status filter
// @route   GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'All' && status.trim() !== '') {
      query.status = status.trim();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { invoiceNumber: { $regex: term, $options: 'i' } },
        { 'customer.name': { $regex: term, $options: 'i' } },
        { 'customer.phone': { $regex: term, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });

    // Aggregate summary
    const all = await Invoice.find({});
    const completed = all.filter(i => i.status === 'Completed');
    const totalRevenue = completed.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const completedCount = completed.length;
    const cancelledCount = all.filter(i => i.status === 'Cancelled').length;

    return res.status(200).json({
      success: true,
      count: invoices.length,
      summary: {
        totalInvoices: all.length,
        completedCount,
        cancelledCount,
        totalRevenue: Number(totalRevenue.toFixed(2))
      },
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new invoice / checkout sale and atomically decrease stock
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { customer, items, paymentMethod, taxRate = 5, notes } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A sale invoice must contain at least one product item.'
      });
    }

    // Step 1: Validate line items against DB & prepare verified snapshots
    const preparedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format in line items: ${item.productId}`
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'All item quantities must be positive integers (at least 1).'
        });
      }

      // Fetch official current product from database (never trust client prices)
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} does not exist in inventory.`
        });
      }

      // Check stock availability
      if (product.quantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity} units, requested: ${qty} units.`
        });
      }

      const unitPrice = product.price;
      const lineTotal = Number((unitPrice * qty).toFixed(2));
      calculatedSubtotal += lineTotal;

      preparedItems.push({
        productId: product._id,
        name: product.name,
        price: unitPrice,
        quantity: qty,
        total: lineTotal
      });
    }

    // Calculate tax & grand total
    const numTaxRate = Math.max(0, parseFloat(taxRate) || 0);
    const calculatedTaxAmount = Number(((calculatedSubtotal * numTaxRate) / 100).toFixed(2));
    const calculatedGrandTotal = Number((calculatedSubtotal + calculatedTaxAmount).toFixed(2));

    // Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Step 2: Atomic stock decrement with rollback safety
    const decrementedItems = [];
    try {
      for (const it of preparedItems) {
        // Atomic decrement query: only decrements if quantity is still >= it.quantity
        const updated = await Product.findOneAndUpdate(
          { _id: it.productId, quantity: { $gte: it.quantity } },
          { $inc: { quantity: -it.quantity } },
          { new: true }
        );

        if (!updated) {
          throw new Error(`Insufficient stock for "${it.name}" during checkout execution.`);
        }
        decrementedItems.push({ productId: it.productId, quantity: it.quantity });
      }

      // Step 3: Create & save Invoice
      const invoice = new Invoice({
        invoiceNumber,
        customer: {
          name: customer && customer.name && customer.name.trim() ? customer.name.trim() : 'Walk-in Customer',
          phone: customer && customer.phone ? customer.phone.trim() : '',
          email: customer && customer.email ? customer.email.trim() : '',
          address: customer && customer.address ? customer.address.trim() : ''
        },
        items: preparedItems,
        subtotal: calculatedSubtotal,
        taxRate: numTaxRate,
        taxAmount: calculatedTaxAmount,
        grandTotal: calculatedGrandTotal,
        paymentMethod: paymentMethod || 'Cash',
        status: 'Completed',
        notes: notes ? notes.trim() : ''
      });

      const savedInvoice = await invoice.save();

      return res.status(201).json({
        success: true,
        message: `Sale completed and Invoice ${savedInvoice.invoiceNumber} generated successfully.`,
        data: savedInvoice
      });
    } catch (checkoutError) {
      // ROLLBACK: Restore stock for any item that was decremented prior to failure
      for (const roll of decrementedItems) {
        await Product.findByIdAndUpdate(roll.productId, { $inc: { quantity: roll.quantity } });
      }
      console.error('Checkout error with rollback executed:', checkoutError.message);
      return res.status(400).json({
        success: false,
        message: checkoutError.message || 'Checkout failed. Stock has been preserved.'
      });
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Cancel / void an invoice and safely restore sold quantities to stock exactly once
// @route   PUT /api/invoices/:id/cancel
exports.cancelInvoice = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID format' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Safety constraint: Prevent repeated cancellation
    if (invoice.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Invoice "${invoice.invoiceNumber}" is already cancelled. Stock was already restored on ${invoice.cancelledAt ? new Date(invoice.cancelledAt).toLocaleString('en-IN') : 'earlier date'}.`
      });
    }

    // Restore stock for all items
    const restoredProducts = [];
    for (const item of invoice.items) {
      if (item.productId) {
        const prod = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantity } },
          { new: true }
        );
        if (prod) {
          restoredProducts.push(`${prod.name} (+${item.quantity})`);
        }
      }
    }

    // Update invoice status
    invoice.status = 'Cancelled';
    invoice.cancelledAt = new Date();
    invoice.cancellationReason = req.body.reason ? req.body.reason.trim() : 'Cancelled by user / stock returned';

    const savedInvoice = await invoice.save();

    return res.status(200).json({
      success: true,
      message: `Invoice ${savedInvoice.invoiceNumber} cancelled successfully. Restored stock: ${restoredProducts.join(', ') || 'No products to restore'}.`,
      data: savedInvoice
    });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Disallow permanent invoice deletion
// @route   DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Permanent deletion of invoice records is strictly prohibited for legal/audit traceability. Please use the Cancel/Void endpoint instead.'
  });
};
