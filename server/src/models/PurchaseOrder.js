
const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  items: {
    type: [purchaseOrderItemSchema],
    required: true,
    validate: {
      validator: items => items.length > 0,
      message: 'A purchase order must contain at least one item.'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Ordered', 'Received', 'Cancelled'],
    default: 'Draft'
  },
  receivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
