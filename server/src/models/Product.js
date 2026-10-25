const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [60, 'Category cannot exceed 60 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for calculating total value of this product stock
productSchema.virtual('totalValue').get(function () {
  return Number(((this.price || 0) * (this.quantity || 0)).toFixed(2));
});

// Virtual property indicating low-stock status (threshold <= 5)
productSchema.virtual('isLowStock').get(function () {
  return typeof this.quantity === 'number' && this.quantity <= 5;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
