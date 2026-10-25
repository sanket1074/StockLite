const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Supplier = require('./src/models/Supplier');
const Product = require('./src/models/Product');

const defaultCategories = [
  { name: 'Electronics', description: 'Computing, displays, mobile accessories, and electronic components' },
  { name: 'Furniture', description: 'Ergonomic desks, chairs, storage units, and office fixtures' },
  { name: 'Stationery', description: 'Writing instruments, notebooks, files, and desk accessories' },
  { name: 'Packaging Materials', description: 'Corrugated cartons, bubble rolls, tape, and shipping labels' },
  { name: 'Office Supplies', description: 'Paper shredders, presentation boards, laminators, and supplies' }
];

const defaultSuppliers = [
  {
    name: 'Apex Tech Solutions Ltd',
    contactPerson: 'Vikram Sharma',
    email: 'vikram@apextech.in',
    phone: '+91 98201 12345',
    address: 'Plot 42, Electronic City Phase 1, Bengaluru, Karnataka 560100',
    notes: 'Primary supplier for monitors, peripherals, and electronic components. Standard Net 30 terms.'
  },
  {
    name: 'Urban Comfort Furnishings',
    contactPerson: 'Priya Narang',
    email: 'priya@urbancomfort.com',
    phone: '+91 98112 54321',
    address: 'Survey 108, Kirti Nagar Industrial Area, New Delhi 110015',
    notes: 'Manufacturer of ergonomic chairs and motorized standing desks. 2-week dispatch lead time.'
  },
  {
    name: 'PaperCraft & Print Supplies',
    contactPerson: 'Rajesh Gupta',
    email: 'rgupta@papercraft.org',
    phone: '+91 98450 87654',
    address: '14/B, Sivakasi Road, Industrial Estate, Madurai, Tamil Nadu 625001',
    notes: 'Wholesaler of premium ruled journals, stationery packs, and corrugated shipping boxes.'
  }
];

async function seedMasterData() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocklite';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    // 1. Non-destructively seed categories
    console.log('\n--- Syncing Categories ---');
    // Ensure any category already on a product is in Category master collection
    const distinctProductCats = await Product.distinct('category');
    for (const catName of distinctProductCats) {
      if (catName && catName.trim()) {
        const found = await Category.findOne({ name: { $regex: `^${catName.trim()}$`, $options: 'i' } });
        if (!found) {
          await Category.create({
            name: catName.trim(),
            description: `Auto-registered from inventory catalog items`
          });
          console.log(`✓ Added Category from inventory: "${catName.trim()}"`);
        }
      }
    }

    for (const cat of defaultCategories) {
      const found = await Category.findOne({ name: { $regex: `^${cat.name}$`, $options: 'i' } });
      if (!found) {
        await Category.create(cat);
        console.log(`✓ Created Category: "${cat.name}"`);
      } else {
        console.log(`• Category "${cat.name}" already exists.`);
      }
    }

    // 2. Non-destructively seed suppliers
    console.log('\n--- Syncing Suppliers ---');
    const existingSuppliersCount = await Supplier.countDocuments();
    if (existingSuppliersCount === 0) {
      await Supplier.insertMany(defaultSuppliers);
      console.log(`✓ Seeded ${defaultSuppliers.length} initial suppliers.`);
    } else {
      console.log(`• Database already has ${existingSuppliersCount} suppliers. Skipping.`);
    }

    const totalCats = await Category.countDocuments();
    const totalSups = await Supplier.countDocuments();
    const totalProds = await Product.countDocuments();

    console.log(`\n========================================`);
    console.log(` Master Data Summary:`);
    console.log(` Categories: ${totalCats}`);
    console.log(` Suppliers:  ${totalSups}`);
    console.log(` Products:   ${totalProds} (Preserved intact)`);
    console.log(`========================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed Master Data Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedMasterData();
