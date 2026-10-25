const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [60, 'Category name cannot exceed 60 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for product count (can be populated or manually computed in controller)
categorySchema.virtual('products', {
  ref: 'Product',
  localField: 'name',
  foreignField: 'category'
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
