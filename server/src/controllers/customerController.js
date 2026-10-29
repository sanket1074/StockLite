
const Customer = require('../models/Customer');

// GET: Fetch all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers.' });
  }
};

// GET: Fetch one customer
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid customer ID.' });
  }
};

// POST: Add a customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        message: 'Customer name and phone are required.'
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address
    });

    res.status(201).json({
      message: 'Customer created successfully.',
      customer
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || 'Failed to create customer.'
    });
  }
};

// PUT: Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        message: 'Customer name and phone are required.'
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, address },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      message: 'Customer updated successfully.',
      customer
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || 'Failed to update customer.'
    });
  }
};

// DELETE: Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      message: 'Customer deleted successfully.'
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid customer ID.' });
  }
};
