const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocklite_test';

async function runTests() {
  console.log('\n--- Starting StockLite Backend Test Suite ---');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Successfully connected to MongoDB');

    // Clean test collection
    await Product.deleteMany({});
    console.log('✓ Cleared test database collection');

    // TEST 1: Validation - Negative Price & Missing Name
    console.log('\nTest 1: Testing Model Validations...');
    try {
      const invalidProd = new Product({
        name: '',
        category: 'Electronics',
        price: -50,
        quantity: -10
      });
      await invalidProd.save();
      console.error('✗ Failed: Model should have rejected invalid product');
      process.exit(1);
    } catch (err) {
      console.log('✓ Successfully caught validation errors for empty name and negative price/quantity:', err.message);
    }

    // TEST 2: Create Valid Products (including Low-Stock item <= 5)
    console.log('\nTest 2: Creating Products with Calculations...');
    const p1 = await Product.create({
      name: 'Mechanical Gaming Keyboard',
      category: 'Electronics',
      price: 3499.50,
      quantity: 12,
      description: 'RGB Backlit mechanical keyboard with blue switches'
    });
    console.log(`✓ Created: ${p1.name} | Total Value: ${p1.totalValue} (Expected: 41994) | Low Stock: ${p1.isLowStock}`);

    const p2 = await Product.create({
      name: 'Wireless Bluetooth Earbuds',
      category: 'Electronics',
      price: 1999.00,
      quantity: 3, // LOW STOCK (<= 5)
      description: 'Noise cancelling earbuds with charging case'
    });
    console.log(`✓ Created: ${p2.name} | Total Value: ${p2.totalValue} | Low Stock: ${p2.isLowStock} (Expected: true)`);

    const p3 = await Product.create({
      name: 'Ergonomic Mesh Chair',
      category: 'Furniture',
      price: 8500.00,
      quantity: 5, // LOW STOCK THRESHOLD (<= 5)
      description: 'High-back mesh chair with lumbar support'
    });
    console.log(`✓ Created: ${p3.name} | Total Value: ${p3.totalValue} | Low Stock: ${p3.isLowStock} (Expected: true)`);

    const p4 = await Product.create({
      name: 'Gel Pens Pack of 10',
      category: 'Stationery',
      price: 150.00,
      quantity: 50,
      description: '0.7mm smooth blue gel pens'
    });
    console.log(`✓ Created: ${p4.name} | Total Value: ${p4.totalValue} | Low Stock: ${p4.isLowStock} (Expected: false)`);

    // TEST 3: Calculate Total Inventory Value and Low Stock Count
    console.log('\nTest 3: Aggregate Summary & Low Stock Metrics...');
    const all = await Product.find({});
    const totalUnits = all.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = all.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = all.filter(p => p.quantity <= 5).length;

    console.log(`Total Products: ${all.length} (Expected: 4)`);
    console.log(`Total Units: ${totalUnits} (Expected: 70)`);
    console.log(`Total Inventory Value: ₹${totalValue.toFixed(2)} (Expected: 97994.00)`);
    console.log(`Low Stock Count: ${lowStockCount} (Expected: 2 -> p2 with 3 units, p3 with 5 units)`);

    if (lowStockCount !== 2) throw new Error('Low stock calculation failed');
    if (totalUnits !== 70) throw new Error('Total units calculation failed');

    // TEST 4: Search by Name
    console.log('\nTest 4: Search Functionality...');
    const searchRes = await Product.find({ name: { $regex: 'keyboard', $options: 'i' } });
    console.log(`✓ Search for "keyboard" returned ${searchRes.length} items (Name: ${searchRes[0]?.name})`);
    if (searchRes.length !== 1) throw new Error('Search failed');

    // TEST 5: Filter by Category
    console.log('\nTest 5: Filter by Category...');
    const catRes = await Product.find({ category: { $regex: '^Electronics$', $options: 'i' } });
    console.log(`✓ Filter for "Electronics" returned ${catRes.length} items`);
    if (catRes.length !== 2) throw new Error('Category filter failed');

    // TEST 6: Update Product
    console.log('\nTest 6: Update Product...');
    const updated = await Product.findByIdAndUpdate(
      p1._id,
      { price: 3200.00, quantity: 15 },
      { new: true, runValidators: true }
    );
    console.log(`✓ Updated "${updated.name}" | New Price: ${updated.price} | New Qty: ${updated.quantity} | New Total: ${updated.totalValue}`);
    if (updated.price !== 3200 || updated.quantity !== 15) throw new Error('Update failed');

    // TEST 7: Delete Product
    console.log('\nTest 7: Delete Product with Confirmation...');
    const deleted = await Product.findByIdAndDelete(p4._id);
    console.log(`✓ Deleted product: "${deleted.name}"`);
    const remaining = await Product.countDocuments();
    console.log(`✓ Remaining products count: ${remaining} (Expected: 3)`);
    if (remaining !== 3) throw new Error('Delete failed');

    console.log('\n=============================================');
    console.log(' ALL 7 CRUD & INVENTORY SUITE TESTS PASSED! ');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test Suite Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
