import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Search,
  Printer,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Layers
} from 'lucide-react';
import InvoicePrintModal from './InvoicePrintModal';

const API_BASE = '/api';

const InvoicesPage = ({ addToast, onInventoryUpdated }) => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Preview / Print modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Cancellation confirm modal state
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer returned items');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await fetch(`${API_BASE}/invoices?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setInvoices(data.data || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        addToast(data.message || 'Failed to fetch invoice history', 'error');
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
      addToast('Cannot connect to server to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, addToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenCancelModal = (inv) => {
    if (inv.status === 'Cancelled') {
      addToast(`Invoice ${inv.invoiceNumber} is already cancelled.`, 'info');
      return;
    }
    setInvoiceToCancel(inv);
    setCancelReason('Customer returned merchandise / order cancelled');
  };

  const handleConfirmCancel = async () => {
    if (!invoiceToCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceToCancel._id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(data.message || `Invoice ${invoiceToCancel.invoiceNumber} cancelled and stock returned!`, 'success');
        setInvoiceToCancel(null);
        fetchInvoices();
        if (onInventoryUpdated) onInventoryUpdated();
      } else {
        addToast(data.message || 'Failed to cancel invoice', 'error');
      }
    } catch (err) {
      console.error('Cancel invoice error:', err);
      addToast('Network error while cancelling invoice', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      {/* Financial Summary KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Invoices</span>
            <span className="stat-value">{summary.totalInvoices}</span>
            <span className="stat-subtext">{summary.completedCount} active, {summary.cancelledCount} voided</span>
          </div>
          <div className="stat-icon-wrapper stat-icon-indigo">
            <Receipt size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Sales Revenue</span>
            <span className="stat-value">{formatCurrency(summary.totalRevenue)}</span>
            <span className="stat-subtext">Completed sales (net of voids)</span>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Completed Orders</span>
            <span className="stat-value" style={{ color: '#10b981' }}>
              {summary.completedCount}
            </span>
            <span className="stat-subtext">Fulfilled customer orders</span>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Cancelled / Voided</span>
            <span className="stat-value" style={{ color: summary.cancelledCount > 0 ? '#ef4444' : 'var(--text-main)' }}>
              {summary.cancelledCount}
            </span>
            <span className="stat-subtext">Stock safely restored</span>
          </div>
          <div className="stat-icon-wrapper stat-icon-rose">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="controls-card">
        <div className="controls-row">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by invoice number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="All">All Invoices</option>
              <option value="Completed">Completed Only</option>
              <option value="Cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="table-card">
        <div className="table-header-bar">
          <div className="table-header-title">
            <Receipt size={20} color="#4f46e5" />
            <h3>Sales Invoices & Receipts Ledger</h3>
            <span className="count-chip">
              {invoices.length} {invoices.length === 1 ? 'record' : 'records'}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading sales invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Receipt size={36} />
            </div>
            <h4>No invoices found</h4>
            <p>No historical sales match your criteria or no transactions have been executed yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items Snapshot</th>
                  <th>Payment</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const isCancelled = inv.status === 'Cancelled';
                  const totalItems = inv.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;

                  return (
                    <tr key={inv._id} style={isCancelled ? { backgroundColor: '#fef2f2' } : {}}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4f46e5' }}>
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {formatDate(inv.createdAt)}
                      </td>
                      <td>
                        <div className="product-cell">
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {inv.customer?.name || 'Walk-in Customer'}
                          </span>
                          {inv.customer?.phone && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {inv.customer.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="stock-badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                          <Layers size={12} />
                          <span>{inv.items?.length || 0} SKU ({totalItems} pcs)</span>
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <span className="category-badge">{inv.paymentMethod || 'Cash'}</span>
                      </td>
                      <td className="number-cell" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td>
                        {isCancelled ? (
                          <span className="stock-badge out-of-stock">
                            <XCircle size={12} />
                            <span>Cancelled</span>
                          </span>
                        ) : (
                          <span className="stock-badge in-stock">
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="action-btn"
                            style={{ color: '#4f46e5', backgroundColor: '#eef2ff' }}
                            onClick={() => setSelectedInvoice(inv)}
                            title="View / Print Invoice"
                          >
                            <Printer size={15} />
                          </button>
                          {!isCancelled && (
                            <button
                              type="button"
                              className="action-btn delete"
                              onClick={() => handleOpenCancelModal(inv)}
                              title="Cancel / Void Invoice (restores stock)"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {invoiceToCancel && (
        <div className="modal-overlay" onClick={() => setInvoiceToCancel(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-content">
              <div className="delete-icon-circle" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                <AlertTriangle size={28} />
              </div>

              <h3>Cancel / Void Invoice?</h3>
              <p>
                Cancelling invoice <strong style={{ color: '#0f172a' }}>"{invoiceToCancel.invoiceNumber}"</strong> will mark it as void and automatically return the sold quantities to your inventory:
              </p>

              <div style={{ margin: '0.75rem 0', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.85rem' }}>
                <strong>Items that will be returned to stock:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                  {invoiceToCancel.items?.map((it, idx) => (
                    <li key={idx}>
                      {it.name}: <strong>+{it.quantity} units</strong> restored
                    </li>
                  ))}
                </ul>
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cancellation Reason (Optional):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Customer returned items, entered wrong SKU..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setInvoiceToCancel(null)} disabled={isCancelling}>
                Close
              </button>
              <button className="btn-danger" onClick={handleConfirmCancel} disabled={isCancelling}>
                <XCircle size={16} />
                <span>{isCancelling ? 'Voiding & Restoring Stock...' : 'Confirm Void & Restore Stock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View / Print Modal */}
      <InvoicePrintModal
        isOpen={Boolean(selectedInvoice)}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};

export default InvoicesPage;
