require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const seedProducts = [
  {
    name: 'Ultra HD 4K Monitor 27"',
    category: 'Electronics',
    price: 24999.0,
    quantity: 8,
    description: 'IPS display with HDR400, USB-C 65W charging, and dual HDMI 2.1'
  },
  {
    name: 'Ergonomic Wireless Mouse',
    category: 'Electronics',
    price: 1499.0,
    quantity: 3, // LOW STOCK (<= 5)
    description: 'Dual mode Bluetooth 5.2 and 2.4G wireless with silent clicks'
  },
  {
    name: 'Adjustable Standing Desk',
    category: 'Furniture',
    price: 18500.0,
    quantity: 4, // LOW STOCK (<= 5)
    description: 'Dual-motor electric standing desk with digital height preset memory'
  },
  {
    name: 'Executive Leather Journal',
    category: 'Stationery',
    price: 350.0,
    quantity: 42,
    description: '192 pages ruled acid-free paper with bookmark ribbon'
  },
  {
    name: 'Mechanical Keyboard (Blue Switch)',
    category: 'Electronics',
    price: 3299.0,
    quantity: 15,
    description: 'Tenkeyless RGB backlit mechanical keyboard with hot-swappable switches'
  },
  {
    name: 'Corrugated Shipping Boxes (Pack of 25)',
    category: 'Packaging Materials',
    price: 799.0,
    quantity: 0, // OUT OF STOCK
    description: '3-ply sturdy corrugated cardboard boxes 12x10x8 inches'
  }
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocklite';
    await mongoose.connect(uri);
    console.log(`[Seed] Connected to MongoDB: ${uri}`);

    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      await Product.insertMany(seedProducts);
      console.log(`[Seed] Successfully seeded ${seedProducts.length} initial products!`);
    } else {
      console.log(`[Seed] Database already contains ${existingCount} products. Skipping initial seed.`);
    }

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedDB();
