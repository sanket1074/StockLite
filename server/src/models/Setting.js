
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  businessName: {
    type: String,
    default: 'StockLite ERP',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
