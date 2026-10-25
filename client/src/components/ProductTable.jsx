import React from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle2, XCircle, PackageOpen } from 'lucide-react';

const ProductTable = ({
  products = [],
  loading,
  onEdit,
  onDelete,
  onOpenAddModal
}) => {
  // Format currency in Indian Rupees (INR)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="table-card">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Loading inventory products...
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <PackageOpen size={36} />
          </div>
          <h4>No products found</h4>
          <p>
            No inventory items match your current filter or search criteria.
            Try resetting your filters or add a new product to your inventory.
          </p>
          <button className="btn-primary" onClick={onOpenAddModal}>
            Add First Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header-bar">
        <div className="table-header-title">
          <h3>Inventory Items</h3>
          <span className="count-chip">{products.length} {products.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total Value</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const qty = product.quantity || 0;
              const price = product.price || 0;
              const totalVal = product.totalValue !== undefined ? product.totalValue : price * qty;
              const isOutOfStock = qty === 0;
              const isLowStock = !isOutOfStock && qty <= 5;

              return (
                <tr
                  key={product._id}
                  className={isLowStock ? 'row-low-stock' : ''}
                >
                  {/* Name & Description */}
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{product.name}</span>
                      {product.description && (
                        <span className="product-desc" title={product.description}>
                          {product.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>

                  {/* Price */}
                  <td className="number-cell">
                    {formatCurrency(price)}
                  </td>

                  {/* Quantity */}
                  <td className="number-cell" style={{ fontWeight: '600' }}>
                    {qty}
                  </td>

                  {/* Total Inventory Value */}
                  <td className="number-cell" style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    {formatCurrency(totalVal)}
                  </td>

                  {/* Status Badge */}
                  <td>
                    {isOutOfStock ? (
                      <span className="stock-badge out-of-stock">
                        <XCircle size={14} />
                        <span>Out of Stock</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="stock-badge low-stock">
                        <AlertTriangle size={14} />
                        <span>Low Stock ({qty})</span>
                      </span>
                    ) : (
                      <span className="stock-badge in-stock">
                        <CheckCircle2 size={14} />
                        <span>In Stock</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(product)}
                        title="Edit product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => onDelete(product)}
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
