import React from 'react';
import { X, Printer, CheckCircle2, XCircle } from 'lucide-react';

const InvoicePrintModal = ({ isOpen, invoice, onClose }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
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

  const isCancelled = invoice.status === 'Cancelled';

  return (
    <div className="modal-overlay no-print-overlay" onClick={onClose}>
      <div
        className="modal-card printable-invoice-card"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} color="#4f46e5" />
            <h3>Sales Invoice Preview</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Receipt</span>
            </button>
            <button className="btn-close" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet Body */}
        <div className="invoice-sheet" id="printable-receipt">
          {/* Invoice Header */}
          <div className="invoice-sheet-header">
            <div>
              <h2 className="invoice-company-name">StockLite ERP</h2>
              <p className="invoice-company-sub">Enterprise Inventory & Retail Terminal</p>
              <div className="invoice-meta-info">
                <span>Date: {formatDate(invoice.createdAt)}</span>
                <span>Payment: {invoice.paymentMethod || 'Cash'}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="invoice-number-pill">{invoice.invoiceNumber}</div>
              <div style={{ marginTop: '0.4rem' }}>
                {isCancelled ? (
                  <span className="status-stamp cancelled-stamp">
                    <XCircle size={14} />
                    <span>CANCELLED / VOIDED</span>
                  </span>
                ) : (
                  <span className="status-stamp paid-stamp">
                    <CheckCircle2 size={14} />
                    <span>PAID / COMPLETED</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Billing Details */}
          <div className="invoice-billing-grid">
            <div className="invoice-billing-box">
              <span className="billing-label">Customer Details:</span>
              <div className="billing-val-name">{invoice.customer?.name || 'Walk-in Customer'}</div>
              {invoice.customer?.phone && (
                <div className="billing-val-sub">Phone: {invoice.customer.phone}</div>
              )}
              {invoice.customer?.email && (
                <div className="billing-val-sub">Email: {invoice.customer.email}</div>
              )}
              {invoice.customer?.address && (
                <div className="billing-val-sub">Address: {invoice.customer.address}</div>
              )}
            </div>

            <div className="invoice-billing-box">
              <span className="billing-label">Transaction Reference:</span>
              <div className="billing-val-sub">System ID: {invoice._id}</div>
              <div className="billing-val-sub">Payment: {invoice.paymentMethod || 'Cash'}</div>
              {isCancelled && invoice.cancelledAt && (
                <div className="billing-val-sub" style={{ color: '#b91c1c', fontWeight: 600 }}>
                  Voided: {formatDate(invoice.cancelledAt)}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="invoice-table-wrap">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Item Description</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="invoice-item-name">{item.name}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Breakdown */}
          <div className="invoice-totals-section">
            <div className="invoice-tax-disclaimer">
              <span>* Configurable demo tax rate ({invoice.taxRate || 5}%) — for assessment preview, not for legal GST filing.</span>
              {invoice.notes && (
                <div style={{ marginTop: '0.4rem', color: '#475569' }}>
                  <strong>Note:</strong> {invoice.notes}
                </div>
              )}
              {isCancelled && invoice.cancellationReason && (
                <div style={{ marginTop: '0.4rem', color: '#b91c1c' }}>
                  <strong>Void Reason:</strong> {invoice.cancellationReason}
                </div>
              )}
            </div>

            <div className="invoice-totals-box">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Estimated Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="totals-row grand-total-row">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="invoice-footer-note">
            Thank you for your business! Items returned within 7 days with invoice will be safely restored to inventory.
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="modal-footer no-print">
          <button className="btn-secondary" onClick={onClose}>
            Close Preview
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Invoice Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;
