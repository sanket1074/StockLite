const app = require('./src/server');

async function testApi() {
  // Wait 1.5 seconds for mongoose connection in server.js to establish
  await new Promise(r => setTimeout(r, 1500));

  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}/api`;

  console.log('\n--- Running End-to-End Server API Tests ---');

  try {
    // 1. Health
    console.log('\n1. Testing GET /api/health ...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log('Health Response:', healthJson);
    if (healthJson.database.readyState !== 1) throw new Error('Database not ready');

    // 2. GET all products
    console.log('\n2. Testing GET /api/products ...');
    const getRes = await fetch(`${baseUrl}/products`);
    const getJson = await getRes.json();
    console.log(`✓ Fetched ${getJson.count} products. Summary:`, getJson.summary);

    // 3. POST new product
    console.log('\n3. Testing POST /api/products ...');
    const createRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'USB-C Fast Charger 65W',
        category: 'Electronics',
        price: 1299,
        quantity: 10,
        description: 'GaN multi-port fast charger'
      })
    });
    const createJson = await createRes.json();
    console.log('✓ Created product ID:', createJson.data._id);
    const newId = createJson.data._id;

    // 4. GET /api/products/:id
    console.log('\n4. Testing GET /api/products/:id ...');
    const getSingleRes = await fetch(`${baseUrl}/products/${newId}`);
    const getSingleJson = await getSingleRes.json();
    console.log('✓ Single Product Name:', getSingleJson.data.name);

    // 5. PUT /api/products/:id
    console.log('\n5. Testing PUT /api/products/:id ...');
    const updateRes = await fetch(`${baseUrl}/products/${newId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: 1199,
        quantity: 2 // Update to low stock
      })
    });
    const updateJson = await updateRes.json();
    console.log('✓ Updated Product New Price:', updateJson.data.price, 'Quantity:', updateJson.data.quantity);

    // 6. DELETE /api/products/:id
    console.log('\n6. Testing DELETE /api/products/:id ...');
    const deleteRes = await fetch(`${baseUrl}/products/${newId}`, {
      method: 'DELETE'
    });
    const deleteJson = await deleteRes.json();
    console.log('✓ Deleted Product Message:', deleteJson.message);

    console.log('\n=============================================');
    console.log(' ALL END-TO-END HTTP API TESTS PASSED! ');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('API Test Error:', err);
    process.exit(1);
  }
}

testApi();
