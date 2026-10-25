import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-content">
          <div className="delete-icon-circle">
            <AlertTriangle size={28} />
          </div>

          <h3>Delete Product?</h3>
          <p>
            Are you sure you want to permanently delete this product from the inventory? This action cannot be undone.
          </p>

          <div className="delete-product-name-highlight">
            {product.name} ({product.category})
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="btn-danger" onClick={() => onConfirm(product._id)} disabled={isDeleting}>
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
