const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all suppliers with optional search
// @route   GET /api/suppliers
exports.getSuppliers = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { contactPerson: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid supplier ID format' });
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    return res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    console.error('Error fetching supplier by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
exports.createSupplier = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { name, contactPerson, email, phone, address, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Supplier company name is required' });
    }
    if (!contactPerson || !contactPerson.trim()) {
      return res.status(400).json({ success: false, message: 'Contact person name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    // Check duplicate supplier name
    const existing = await Supplier.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A supplier named "${name.trim()}" is already registered.`
      });
    }

    const supplier = new Supplier({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : ''
    });

    const savedSupplier = await supplier.save();

    return res.status(201).json({
      success: true,
      message: `Supplier "${savedSupplier.name}" created successfully`,
      data: savedSupplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update supplier by ID
// @route   PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid supplier ID format' });
    }

    const { name, contactPerson, email, phone, address, notes } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      }
      supplier.email = email.trim().toLowerCase();
    }

    if (name && name.trim()) {
      if (name.trim().toLowerCase() !== supplier.name.toLowerCase()) {
        const duplicate = await Supplier.findOne({
          _id: { $ne: id },
          name: { $regex: `^${name.trim()}$`, $options: 'i' }
        });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: `Another supplier named "${name.trim()}" already exists.`
          });
        }
      }
      supplier.name = name.trim();
    }

    if (contactPerson !== undefined) supplier.contactPerson = contactPerson.trim();
    if (phone !== undefined) supplier.phone = phone.trim();
    if (address !== undefined) supplier.address = address.trim();
    if (notes !== undefined) supplier.notes = notes.trim();

    const updatedSupplier = await supplier.save();

    return res.status(200).json({
      success: true,
      message: `Supplier updated successfully`,
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete supplier by ID
// @route   DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid supplier ID format' });
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Check if supplier is referenced by future purchase orders (PurchaseOrder model check when implemented)
    // Dynamic check if PurchaseOrder model is registered
    if (mongoose.models.PurchaseOrder) {
      const referencedCount = await mongoose.models.PurchaseOrder.countDocuments({
        'supplier.supplierId': id
      });
      if (referencedCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete supplier "${supplier.name}" because they are referenced in ${referencedCount} purchase order(s).`
        });
      }
    }

    await Supplier.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Supplier "${supplier.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
