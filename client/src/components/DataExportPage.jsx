
import React, { useState } from 'react';
import { Download, Package, Truck, ReceiptText, RefreshCw } from 'lucide-react';

const EXPORTS = [
  {
    id: 'products',
    title: 'Products',
    description: 'Export product names, categories, prices and stock quantities.',
    endpoint: '/api/products',
    icon: Package,
    filename: 'stocklite-products.csv'
  },
  {
    id: 'suppliers',
    title: 'Suppliers',
    description: 'Export your supplier and vendor directory.',
    endpoint: '/api/suppliers',
    icon: Truck,
    filename: 'stocklite-suppliers.csv'
  },
  {
    id: 'invoices',
    title: 'Invoices',
    description: 'Export sales invoice records, totals and statuses.',
    endpoint: '/api/invoices',
    icon: ReceiptText,
    filename: 'stocklite-invoices.csv'
  }
];

function extractRows(response) {
  if (Array.isArray(response)) return response;

  if (response && Array.isArray(response.data)) return response.data;
  if (response && Array.isArray(response.products)) return response.products;
  if (response && Array.isArray(response.suppliers)) return response.suppliers;
  if (response && Array.isArray(response.invoices)) return response.invoices;

  return [];
}

function formatCell(value) {
  if (value === null || value === undefined) return '';

  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    value = JSON.stringify(value);
  }

  // Protect CSV values containing commas, quotes or line breaks.
  let text = String(value);

  // Prevent spreadsheet formula execution for untrusted text.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCSV(rows, filename) {
  if (!rows.length) {
    throw new Error('No records found to export.');
  }

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];

  const csvContent = [
    columns.map(formatCell).join(','),
    ...rows.map((row) =>
      columns.map((column) => formatCell(row[column])).join(',')
    )
  ].join('\r\n');

  // BOM helps Excel display text correctly.
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DataExportPage() {
  const [loadingId, setLoadingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleExport(item) {
    setLoadingId(item.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(item.endpoint);

      if (!response.ok) {
        throw new Error(
          `Could not load ${item.title.toLowerCase()}. Check that the backend is running.`
        );
      }

      const result = await response.json();
      const rows = extractRows(result);

      if (!rows.length) {
        throw new Error(`No ${item.title.toLowerCase()} records available to export.`);
      }

      downloadCSV(rows, item.filename);
      setMessage(`${item.title}: ${rows.length} records exported successfully.`);
    } catch (err) {
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setLoadingId('');
    }
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <h2>Data Export Center</h2>
        <p>Download your StockLite ERP records as CSV files for Excel.</p>
      </div>

      {(message || error) && (
        <div
          role={error ? 'alert' : 'status'}
          style={{
            marginTop: 20,
            padding: '12px 16px',
            borderRadius: 10,
            color: error ? '#b91c1c' : '#166534',
            background: error ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`
          }}
        >
          {error || message}
        </div>
      )}

      <div className="export-grid">
        {EXPORTS.map((item) => {
          const Icon = item.icon;
          const isLoading = loadingId === item.id;

          return (
            <div className="export-card" key={item.id}>
              <div className="export-card-icon">
                <Icon size={25} />
              </div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleExport(item)}
                disabled={Boolean(loadingId)}
              >
                {isLoading ? (
                  <RefreshCw size={17} className="spin-icon" />
                ) : (
                  <Download size={17} />
                )}
                <span>{isLoading ? 'Preparing CSV...' : 'Export CSV'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
