
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const [productRes, invoiceRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/invoices')
        ]);

        if (!productRes.ok || !invoiceRes.ok) {
          throw new Error('Unable to load report data.');
        }

        const [productData, invoiceData] = await Promise.all([
          productRes.json(),
          invoiceRes.json()
        ]);

        setProducts(productData.data || productData.products || []);
        setInvoices(invoiceData.data || invoiceData.invoices || []);
      } catch (err) {
        setError(err.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const money = amount =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const totalUnits = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0), 0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + Number(product.price || 0) * Number(product.quantity || 0), 0
  );

  const lowStock = products.filter(
    product => Number(product.quantity || 0) <= 5
  ).length;

  const completedInvoices = invoices.filter(
    invoice => !['Cancelled', 'Void', 'Voided'].includes(invoice.status)
  );

  const revenue = completedInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || invoice.grandTotal || 0), 0
  );

  const cards = [
    { title: 'Total Products', value: products.length },
    { title: 'Total Units', value: totalUnits },
    { title: 'Inventory Value', value: money(inventoryValue) },
    { title: 'Low Stock Items', value: lowStock },
    { title: 'Invoices', value: completedInvoices.length },
    { title: 'Sales Revenue', value: money(revenue) }
  ];

  if (loading) return <div className="page-container">Loading reports...</div>;

  return (
    <div className="page-container reports-page">
      <div className="page-heading">
        <h2>Reports & Analytics</h2>
        <p>A quick overview of your inventory and sales.</p>
      </div>

      {error && <p role="alert" style={{ color: '#c62828' }}>{error}</p>}

      <div className="stats-grid">
        {cards.map(card => (
          <div className="stat-card" key={card.title}>
            <div className="stat-info">
              <span className="stat-label">{card.title}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-card" style={{ marginTop: 24 }}>
        <div className="table-header-bar">
          <div className="table-header-title">
            <h3>Current Inventory Summary</h3>
          </div>
        </div>

<div className="inventory-table-wrapper" style={{ overflowX: 'auto' }}>          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category || '—'}</td>
                  <td>{product.quantity}</td>
                  <td>{money(product.price)}</td>
                  <td>{money(Number(product.price || 0) * Number(product.quantity || 0))}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
