
import React, { useEffect, useState } from 'react';
import { Printer, RefreshCw } from 'lucide-react';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

export default function PrintReportsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Could not load inventory data.');

      const result = await response.json();
      const rows = Array.isArray(result)
        ? result
        : result.data || result.products || [];

      setProducts(rows);
    } catch (err) {
      setError(err.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const totalUnits = products.reduce(
    (sum, product) => sum + (Number(product.quantity) || 0),
    0
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      (Number(product.price) || 0) *
      (Number(product.quantity) || 0),
    0
  );

  function printReport() {
    window.print();
  }

  return (
    <div className="page-container print-report-page">
      <div className="page-heading no-print">
        <h2>Print Inventory Report</h2>
        <p>Prepare a printable summary of your current stock.</p>
      </div>

      <div className="print-report-actions no-print">
        <button
          type="button"
          className="btn-refresh"
          onClick={loadProducts}
          disabled={loading}
          title="Refresh inventory"
        >
          <RefreshCw size={16} />
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={printReport}
          disabled={loading || Boolean(error) || products.length === 0}
        >
          <Printer size={17} />
          <span>Print Report</span>
        </button>
      </div>

      {loading && <p className="no-print">Loading inventory report...</p>}

      {error && (
        <p className="no-print" role="alert" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="print-report-sheet">
          <div className="print-report-heading">
            <div>
              <h1>StockLite ERP</h1>
              <p>Current Inventory Report</p>
            </div>
            <div className="print-report-date">
              <strong>Generated on</strong>
              <span>
                {new Intl.DateTimeFormat('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }).format(new Date())}
              </span>
            </div>
          </div>

          <div className="print-report-summary">
            <div>
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>
            <div>
              <span>Total Units</span>
              <strong>{totalUnits}</strong>
            </div>
            <div>
              <span>Total Inventory Value</span>
              <strong>{money(totalValue)}</strong>
            </div>
          </div>

          <div className="print-report-table-wrap">
            <table className="stock-table print-report-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const quantity = Number(product.quantity) || 0;
                  const price = Number(product.price) || 0;

                  return (
                    <tr key={product._id || index}>
                      <td>{index + 1}</td>
                      <td>{product.name || '—'}</td>
                      <td>{product.category || '—'}</td>
                      <td>{quantity}</td>
                      <td>{money(price)}</td>
                      <td>{money(price * quantity)}</td>
                      <td>
                        {quantity === 0
                          ? 'Out of Stock'
                          : quantity <= 5
                            ? 'Low Stock'
                            : 'In Stock'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="print-report-footer">
            This report reflects the inventory data available at the time of generation.
          </p>
        </section>
      )}
    </div>
  );
}
