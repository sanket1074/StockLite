const mongoose = require('mongoose');
const Product = require('../models/Product');

// Helper to check MongoDB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all products (with optional search, category filter, low-stock filter)
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please verify your MongoDB service or connection string.'
      });
    }

    const { search, category, lowStock } = req.query;
    let query = {};

    // Search by product name (case-insensitive)
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by category
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Filter low stock (<= 5)
    if (lowStock === 'true') {
      query.quantity = { $lte: 5 };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Aggregate summary across ALL inventory for dashboard metrics
    const allProducts = await Product.find({});
    const totalProducts = allProducts.length;
    const totalUnits = allProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = allProducts.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const lowStockCount = allProducts.filter(item => item.quantity <= 5).length;
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();

    return res.status(200).json({
      success: true,
      count: products.length,
      summary: {
        totalProducts,
        totalUnits,
        totalValue: Number(totalValue.toFixed(2)),
        lowStockCount,
        categories
      },
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Cannot create product.'
      });
    }

    let { name, category, price, quantity, description } = req.body;

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (price === undefined || price === null || price === '' || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative price is required' });
    }
    if (quantity === undefined || quantity === null || quantity === '' || isNaN(quantity) || Number(quantity) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative quantity is required' });
    }

    const product = new Product({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Math.floor(Number(quantity)),
      description: description ? description.trim() : ''
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
};

// @desc    Update product by ID
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Cannot update product.'
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    let { name, category, price, quantity, description } = req.body;

    // Validate fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Product name cannot be empty' });
    }
    if (category !== undefined && (!category || !category.trim())) {
      return res.status(400).json({ success: false, message: 'Category cannot be empty' });
    }
    if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
    }
    if (quantity !== undefined && (isNaN(quantity) || Number(quantity) < 0)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a non-negative number' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Math.floor(Number(quantity));
    if (description !== undefined) updateData.description = description.trim();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
};

// @desc    Delete product by ID
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Cannot delete product.'
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product "${deletedProduct.name}" deleted successfully`,
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    });
  }
};
