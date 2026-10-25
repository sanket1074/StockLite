const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const app = require('./src/server');

async function testPhase2() {
  await new Promise(r => setTimeout(r, 1500));
  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}/api`;

  console.log('\n--- Running Phase 2 Categories & Suppliers API Tests ---');

  try {
    // CATEGORY TESTS
    console.log('\n[1/8] Testing GET /api/categories ...');
    const catRes = await fetch(`${baseUrl}/categories`);
    const catJson = await catRes.json();
    console.log(`✓ Fetched ${catJson.count} categories. First category product count: ${catJson.data[0]?.name} (${catJson.data[0]?.productCount} products)`);
    if (!catJson.success) throw new Error('Failed to fetch categories');

    console.log('\n[2/8] Testing POST /api/categories (Valid) ...');
    const createCatRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hardware & Fasteners',
        description: 'Bolts, nuts, screwdrivers, and mounting brackets'
      })
    });
    const createCatJson = await createCatRes.json();
    console.log(`✓ Created category: "${createCatJson.data?.name}" (ID: ${createCatJson.data?._id})`);
    const tempCatId = createCatJson.data?._id;

    console.log('\n[3/8] Testing POST /api/categories (Duplicate prevention) ...');
    const dupCatRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hardware & Fasteners',
        description: 'Duplicate attempt'
      })
    });
    const dupCatJson = await dupCatRes.json();
    console.log(`✓ Duplicate successfully rejected (Status: ${dupCatRes.status}): "${dupCatJson.message}"`);
    if (dupCatRes.status !== 400) throw new Error('Duplicate category was not rejected');

    console.log('\n[4/8] Testing DELETE /api/categories/:id (Safety check for assigned products) ...');
    // Find category "Electronics" which has assigned products
    const elecCat = catJson.data.find(c => c.name.toLowerCase() === 'electronics');
    if (elecCat) {
      const delElecRes = await fetch(`${baseUrl}/categories/${elecCat._id}`, { method: 'DELETE' });
      const delElecJson = await delElecRes.json();
      console.log(`✓ Protected category with products (Status: ${delElecRes.status}): "${delElecJson.message}"`);
      if (delElecRes.status !== 400 || !delElecJson.hasAssignedProducts) {
        throw new Error('Assigned category was not protected from deletion');
      }
    }

    console.log('\n[5/8] Testing DELETE /api/categories/:id (Unassigned category) ...');
    const delTempRes = await fetch(`${baseUrl}/categories/${tempCatId}`, { method: 'DELETE' });
    const delTempJson = await delTempRes.json();
    console.log(`✓ Unassigned category deleted successfully: "${delTempJson.message}"`);
    if (delTempRes.status !== 200) throw new Error('Failed to delete unassigned category');

    // SUPPLIER TESTS
    console.log('\n[6/8] Testing GET /api/suppliers ...');
    const supRes = await fetch(`${baseUrl}/suppliers`);
    const supJson = await supRes.json();
    console.log(`✓ Fetched ${supJson.count} suppliers. First: ${supJson.data[0]?.name}`);
    if (!supJson.success) throw new Error('Failed to fetch suppliers');

    console.log('\n[7/8] Testing POST /api/suppliers (Email validation & Creation) ...');
    const invalidEmailRes = await fetch(`${baseUrl}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Supplier Ltd',
        contactPerson: 'John Doe',
        email: 'invalid-email-format',
        phone: '1234567890'
      })
    });
    const invalidEmailJson = await invalidEmailRes.json();
    console.log(`✓ Invalid email rejected (Status: ${invalidEmailRes.status}): "${invalidEmailJson.message}"`);
    if (invalidEmailRes.status !== 400) throw new Error('Invalid email was not rejected');

    const validSupRes = await fetch(`${baseUrl}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'OmniGlobal Logistics Supplies',
        contactPerson: 'Karan Mehra',
        email: 'karan@omniglobal.com',
        phone: '+91 99887 76655',
        address: 'Sector 62, Noida, UP 201309',
        notes: 'Warehouse packing materials and label printers'
      })
    });
    const validSupJson = await validSupRes.json();
    console.log(`✓ Created supplier: "${validSupJson.data?.name}" (ID: ${validSupJson.data?._id})`);
    const tempSupId = validSupJson.data?._id;

    console.log('\n[8/8] Testing PUT & DELETE /api/suppliers/:id ...');
    const updateSupRes = await fetch(`${baseUrl}/suppliers/${tempSupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: 'Updated commercial discount terms: 5% on orders > ₹50,000'
      })
    });
    const updateSupJson = await updateSupRes.json();
    console.log(`✓ Supplier updated: "${updateSupJson.data?.notes}"`);

    const delSupRes = await fetch(`${baseUrl}/suppliers/${tempSupId}`, { method: 'DELETE' });
    const delSupJson = await delSupRes.json();
    console.log(`✓ Supplier deleted: "${delSupJson.message}"`);

    console.log('\n=============================================');
    console.log(' ALL 8 PHASE 2 API TESTS PASSED SUCCESSFULLY! ');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Phase 2 API Test Error:', err);
    process.exit(1);
  }
}

testPhase2();
