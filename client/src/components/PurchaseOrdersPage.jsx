
import { useEffect, useState } from 'react';

const API = '/api/purchase-orders';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState([
    { product: '', quantity: 1, unitCost: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [orderRes, productRes, supplierRes] = await Promise.all([
        fetch(API),
        fetch('/api/products'),
        fetch('/api/suppliers')
      ]);

      if (!orderRes.ok || !productRes.ok || !supplierRes.ok) {
        throw new Error('Could not load purchase order data.');
      }

      const [orderData, productData, supplierData] = await Promise.all([
        orderRes.json(),
        productRes.json(),
        supplierRes.json()
      ]);
      console.log('RAW PRODUCTS:', productData);
console.log('RAW SUPPLIERS:', supplierData);

     
setOrders(Array.isArray(orderData) ? orderData : orderData.data || orderData.orders || []);
setProducts(Array.isArray(productData) ? productData : productData.data || productData.products || []);
setSuppliers(Array.isArray(supplierData) ? supplierData : supplierData.data || supplierData.suppliers || []);

    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }
console.log('Purchase order data:', { products, suppliers });
  useEffect(() => {
    loadData();
  }, []);

  function updateItem(index, field, value) {
    setItems(current => current.map((item, i) => {
      if (i !== index) return item;

      const updated = { ...item, [field]: value };

      if (field === 'product') {
        const product = products.find(p => p._id === value);
        updated.unitCost = product ? Number(product.price) || 0 : 0;
      }

      return updated;
    }));
  }

  function addItem() {
    setItems(current => [
      ...current,
      { product: '', quantity: 1, unitCost: 0 }
    ]);
  }

  function removeItem(index) {
    setItems(current => current.filter((_, i) => i !== index));
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0),
    0
  );

  async function createOrder(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supplier) {
      setError('Please select a supplier.');
      return;
    }

    if (items.some(item =>
      !item.product ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1 ||
      !Number.isFinite(Number(item.unitCost)) ||
      Number(item.unitCost) < 0
    )) {
      setError('Select a product and enter a valid quantity and unit cost for every item.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier,
          items: items.map(item => ({
            product: item.product,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost)
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not create purchase order.');
      }

      setMessage('Purchase order created successfully.');
      setSupplier('');
      setItems([{ product: '', quantity: 1, unitCost: 0 }]);
      await loadData();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update order.');
      }

      setMessage(data.message || 'Order status updated.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }

  const money = value => `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  return (
    <div className="purchase-orders-page">
      <div className="page-heading">
        <h2>Purchase Orders</h2>
        <p>Create supplier orders and track incoming stock.</p>
      </div>

      {error && <p role="alert" style={{ color: '#c62828' }}>{error}</p>}
      {message && <p role="status" style={{ color: '#218838' }}>{message}</p>}

      <section className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3>Create Purchase Order</h3>

        <form onSubmit={createOrder}>
          <label htmlFor="po-supplier">Supplier</label>
          <select
            id="po-supplier"
            value={supplier}
            onChange={event => setSupplier(event.target.value)}
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <div style={{ marginTop: 18 }}>
            <h4>Order Items</h4>

            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(150px, 2fr) 1fr 1fr auto',
                  gap: 10,
                  marginBottom: 12,
                  alignItems: 'end'
                }}
              >
                <div>
                  <label>Product</label>
                  <select
                    value={item.product}
                    onChange={event => updateItem(index, 'product', event.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={event => updateItem(index, 'quantity', event.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitCost}
                    onChange={event => updateItem(index, 'unitCost', event.target.value)}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <h3 style={{ textAlign: 'right', marginTop: 20 }}>
            Total: {money(total)}
          </h3>

          <button type="submit" disabled={saving || loading}>
            {saving ? 'Creating...' : 'Create Purchase Order'}
          </button>
        </form>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <h3>Purchase Order History</h3>

        {loading ? (
          <p>Loading purchase orders...</p>
        ) : orders.length === 0 ? (
          <p>No purchase orders yet. Create your first order above.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.supplierName || order.supplier?.name || '—'}</td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td>{money(order.totalAmount)}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.status === 'Draft' && (
                        <button onClick={() => updateStatus(order._id, 'Ordered')}>
                          Mark Ordered
                        </button>
                      )}

                      {order.status === 'Ordered' && (
                        <button onClick={() => {
                          if (window.confirm('Mark this order as received? Stock will increase.')) {
                            updateStatus(order._id, 'Received');
                          }
                        }}>
                          Receive Stock
                        </button>
                      )}

                      {['Draft', 'Ordered'].includes(order.status) && (
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this purchase order?')) {
                              updateStatus(order._id, 'Cancelled');
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
