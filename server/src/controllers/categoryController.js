const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all categories with associated product count
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const categories = await Category.find(query).sort({ name: 1 });

    // Aggregate product counts per category in one query
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    productCounts.forEach(item => {
      if (item._id) countMap[item._id.toLowerCase()] = item.count;
    });

    const enrichedCategories = categories.map(cat => {
      const obj = cat.toObject();
      obj.productCount = countMap[cat.name.toLowerCase()] || 0;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      data: enrichedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const products = await Product.find({ category: category.name });
    const obj = category.toObject();
    obj.productCount = products.length;
    obj.products = products;

    return res.status(200).json({ success: true, data: obj });
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check for duplicate category name (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: `^${trimmedName}$`, $options: 'i' }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${trimmedName}" already exists.`
      });
    }

    const category = new Category({
      name: trimmedName,
      description: description ? description.trim() : ''
    });

    const savedCategory = await category.save();

    return res.status(201).json({
      success: true,
      message: `Category "${savedCategory.name}" created successfully`,
      data: savedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update category by ID
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }

    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const oldName = category.name;
    const newName = name ? name.trim() : oldName;

    // Check if new name conflicts with an existing category
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: `^${newName}$`, $options: 'i' }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another category named "${newName}" already exists.`
        });
      }
    }

    category.name = newName;
    if (description !== undefined) {
      category.description = description.trim();
    }

    const updatedCategory = await category.save();

    // If the category name changed, update existing products with old category name for consistency
    if (newName !== oldName) {
      await Product.updateMany({ category: oldName }, { category: newName });
    }

    return res.status(200).json({
      success: true,
      message: `Category updated successfully`,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete category by ID
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Safety check: count assigned products
    const assignedProductsCount = await Product.countDocuments({
      category: { $regex: `^${category.name}$`, $options: 'i' }
    });

    if (assignedProductsCount > 0) {
      return res.status(400).json({
        success: false,
        hasAssignedProducts: true,
        assignedCount: assignedProductsCount,
        message: `Cannot delete category "${category.name}" because ${assignedProductsCount} product(s) are currently assigned to it. Please reassign or update these products before deleting this category.`
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
