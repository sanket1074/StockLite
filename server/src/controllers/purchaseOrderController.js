
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// GET all purchase orders
exports.getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET one purchase order
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    if (!supplier || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Select a supplier and at least one product.'
      });
    }

    const supplierRecord = await Supplier.findById(supplier);

    if (!supplierRecord) {
      return res.status(400).json({ message: 'Invalid supplier.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({ message: 'Invalid product.' });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: 'Quantity must be a positive whole number.'
        });
      }

      if (!Number.isFinite(unitCost) || unitCost < 0) {
        return res.status(400).json({ message: 'Invalid unit cost.' });
      }

      const lineTotal = quantity * unitCost;
      totalAmount += lineTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        unitCost,
        lineTotal
      });
    }

    const orderNumber =
      `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await PurchaseOrder.create({
      orderNumber,
      supplier: supplierRecord._id,
      supplierName: supplierRecord.name,
      items: orderItems,
      totalAmount,
      status: 'Draft'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE order status
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Ordered', 'Received', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found.' });
    }

    if (order.status === 'Received') {
      return res.status(400).json({
        message: 'This order has already been received.'
      });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({
        message: 'Cancelled orders cannot be updated.'
      });
    }

    if (status === 'Received') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(400).json({
            message: `Product "${item.productName}" no longer exists.`
          });
        }
      }

      // Validate all products before changing any stock.
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        product.quantity += item.quantity;
        await product.save();
      }

      order.receivedAt = new Date();
    }

    order.status = status;
    await order.save();

    res.json({
      message: status === 'Received'
        ? 'Order received and stock updated.'
        : `Order marked as ${status}.`,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
