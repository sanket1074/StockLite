const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./src/server');
const Product = require('./src/models/Product');
const Invoice = require('./src/models/Invoice');

async function testPhase3() {
  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}/api`;

  let localServer;
  try {
    const healthCheck = await fetch(`${baseUrl}/health`).catch(() => null);
    if (!healthCheck || !healthCheck.ok) {
      localServer = app.listen(PORT);
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e) {
    localServer = app.listen(PORT);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n--- Running Phase 3 Sales, Stock Decrement & Invoice API Tests ---');

  try {
    // 1. Initial Invoice listing
    console.log('\n[1/9] Testing GET /api/invoices ...');
    const getRes = await fetch(`${baseUrl}/invoices`);
    const getJson = await getRes.json();
    console.log(`✓ Fetched invoices. Count: ${getJson.count}`);
    if (!getJson.success) throw new Error('Failed to fetch invoices');

    // 2. Find two products with stock to test with
    const p1 = await Product.findOne({ quantity: { $gte: 5 } });
    const p2 = await Product.findOne({ _id: { $ne: p1._id }, quantity: { $gte: 2 } });
    if (!p1 || !p2) throw new Error('Need at least two products with stock for testing');

    const p1InitialQty = p1.quantity;
    const p2InitialQty = p2.quantity;
    console.log(`Selected products for sale test:`);
    console.log(` - Item 1: "${p1.name}" (Initial stock: ${p1InitialQty}, Price: ₹${p1.price})`);
    console.log(` - Item 2: "${p2.name}" (Initial stock: ${p2InitialQty}, Price: ₹${p2.price})`);

    // 3. Test Invalid Product ID
    console.log('\n[2/9] Testing POST /api/invoices (Invalid product ID) ...');
    const invalidIdRes = await fetch(`${baseUrl}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Test' },
        items: [{ productId: '6add00000000000000000000', quantity: 1 }]
      })
    });
    const invalidIdJson = await invalidIdRes.json();
    console.log(`✓ Non-existent product rejected (${invalidIdRes.status}): "${invalidIdJson.message}"`);
    if (invalidIdRes.status !== 400) throw new Error('Non-existent product ID was not rejected');

    // 4. Test Invalid Quantity (<= 0)
    console.log('\n[3/9] Testing POST /api/invoices (Invalid non-positive quantity) ...');
    const invalidQtyRes = await fetch(`${baseUrl}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: p1._id, quantity: 0 }]
      })
    });
    const invalidQtyJson = await invalidQtyRes.json();
    console.log(`✓ Zero/negative quantity rejected (${invalidQtyRes.status}): "${invalidQtyJson.message}"`);
    if (invalidQtyRes.status !== 400) throw new Error('Zero quantity was not rejected');

    // 5. Test Insufficient Stock
    console.log('\n[4/9] Testing POST /api/invoices (Insufficient stock validation) ...');
    const overStockRes = await fetch(`${baseUrl}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: p1._id, quantity: p1InitialQty + 500 }]
      })
    });
    const overStockJson = await overStockRes.json();
    console.log(`✓ Insufficient stock rejected (${overStockRes.status}): "${overStockJson.message}"`);
    if (overStockRes.status !== 400) throw new Error('Over-stock sale was not rejected');

    // Verify stock did not change on failure
    const p1CheckAfterFail = await Product.findById(p1._id);
    if (p1CheckAfterFail.quantity !== p1InitialQty) throw new Error('Stock changed during rejected sale!');
    console.log(`✓ Verified stock preserved untouched after failed sale: ${p1CheckAfterFail.quantity} units`);

    // 6. Test Successful Multiple Line Items Sale
    console.log('\n[5/9] Testing POST /api/invoices (Successful Checkout & Stock Decrement) ...');
    const sellQty1 = 2;
    const sellQty2 = 1;
    const checkoutRes = await fetch(`${baseUrl}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Sunil Verma',
          phone: '+91 98765 43210',
          email: 'sunil@example.com',
          address: '42 MG Road, Bengaluru'
        },
        items: [
          { productId: p1._id, quantity: sellQty1 },
          { productId: p2._id, quantity: sellQty2 }
        ],
        taxRate: 5,
        paymentMethod: 'UPI'
      })
    });
    const checkoutJson = await checkoutRes.json();
    console.log(`✓ Checkout successful! Generated Invoice: ${checkoutJson.data?.invoiceNumber}`);
    console.log(`  Subtotal: ₹${checkoutJson.data?.subtotal}, Demo Tax (5%): ₹${checkoutJson.data?.taxAmount}, Grand Total: ₹${checkoutJson.data?.grandTotal}`);
    if (checkoutRes.status !== 201) throw new Error('Checkout failed');
    const createdInvoiceId = checkoutJson.data?._id;

    // Verify Stock Decrement
    const p1AfterSale = await Product.findById(p1._id);
    const p2AfterSale = await Product.findById(p2._id);
    console.log(`✓ Verified Stock Decrement:`);
    console.log(`  "${p1.name}": ${p1InitialQty} -> ${p1AfterSale.quantity} (Expected: ${p1InitialQty - sellQty1})`);
    console.log(`  "${p2.name}": ${p2InitialQty} -> ${p2AfterSale.quantity} (Expected: ${p2InitialQty - sellQty2})`);
    if (p1AfterSale.quantity !== p1InitialQty - sellQty1) throw new Error('p1 stock decrement incorrect');
    if (p2AfterSale.quantity !== p2InitialQty - sellQty2) throw new Error('p2 stock decrement incorrect');

    // 7. Test GET /api/invoices/:id
    console.log('\n[6/9] Testing GET /api/invoices/:id ...');
    const singleRes = await fetch(`${baseUrl}/invoices/${createdInvoiceId}`);
    const singleJson = await singleRes.json();
    console.log(`✓ Single Invoice retrieved: ${singleJson.data?.invoiceNumber} (${singleJson.data?.items?.length} items)`);
    if (!singleJson.success) throw new Error('Failed to retrieve single invoice');

    // 8. Test Cancellation & Stock Restoration
    console.log('\n[7/9] Testing PUT /api/invoices/:id/cancel (Safe Cancellation & Stock Return) ...');
    const cancelRes = await fetch(`${baseUrl}/invoices/${createdInvoiceId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Customer returned merchandise within 24 hours' })
    });
    const cancelJson = await cancelRes.json();
    console.log(`✓ Invoice cancelled: "${cancelJson.message}"`);
    if (cancelRes.status !== 200 || cancelJson.data?.status !== 'Cancelled') {
      throw new Error('Invoice cancellation failed');
    }

    // Verify Stock Restoration
    const p1AfterCancel = await Product.findById(p1._id);
    const p2AfterCancel = await Product.findById(p2._id);
    console.log(`✓ Verified Stock Restoration:`);
    console.log(`  "${p1.name}": ${p1AfterSale.quantity} -> ${p1AfterCancel.quantity} (Restored to initial: ${p1InitialQty})`);
    console.log(`  "${p2.name}": ${p2AfterSale.quantity} -> ${p2AfterCancel.quantity} (Restored to initial: ${p2InitialQty})`);
    if (p1AfterCancel.quantity !== p1InitialQty) throw new Error('p1 stock not restored correctly');
    if (p2AfterCancel.quantity !== p2InitialQty) throw new Error('p2 stock not restored correctly');

    // 9. Test Repeated Cancellation Rejection
    console.log('\n[8/9] Testing Repeated Cancellation (Prevent double stock restoration) ...');
    const repeatCancelRes = await fetch(`${baseUrl}/invoices/${createdInvoiceId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Trying to cancel again' })
    });
    const repeatCancelJson = await repeatCancelRes.json();
    console.log(`✓ Repeated cancellation rejected (${repeatCancelRes.status}): "${repeatCancelJson.message}"`);
    if (repeatCancelRes.status !== 400) throw new Error('Repeated cancellation was not rejected');

    const p1AfterRepeat = await Product.findById(p1._id);
    if (p1AfterRepeat.quantity !== p1InitialQty) throw new Error('Stock was incorrectly restored again on repeat cancel!');
    console.log(`✓ Verified stock was NOT restored a second time: ${p1AfterRepeat.quantity}`);

    // 10. Test Permanent Deletion Prevention
    console.log('\n[9/9] Testing DELETE /api/invoices/:id (Prohibit permanent deletion) ...');
    const deleteRes = await fetch(`${baseUrl}/invoices/${createdInvoiceId}`, { method: 'DELETE' });
    const deleteJson = await deleteRes.json();
    console.log(`✓ Permanent deletion prohibited (${deleteRes.status}): "${deleteJson.message}"`);
    if (deleteRes.status !== 403) throw new Error('Permanent deletion was not prohibited');

    console.log('\n=============================================');
    console.log(' ALL 9 PHASE 3 API & STOCK TESTS PASSED! ');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Phase 3 API Test Error:', err);
    process.exit(1);
  }
}

testPhase3();
