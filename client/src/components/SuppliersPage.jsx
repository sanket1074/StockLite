import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Truck, Mail, Phone, MapPin } from 'lucide-react';
import SupplierModal from './SupplierModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const API_BASE = '/api';

const SuppliersPage = ({ addToast }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`${API_BASE}/suppliers?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSuppliers(data.data || []);
      } else {
        addToast(data.message || 'Failed to fetch suppliers', 'error');
      }
    } catch (err) {
      console.error('Fetch suppliers error:', err);
      addToast('Cannot connect to server to fetch suppliers', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, addToast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenAdd = () => {
    setSelectedSupplier(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleOpenView = (sup) => {
    setSelectedSupplier(sup);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setSelectedSupplier(sup);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (sup) => {
    setSupplierToDelete(sup);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isEditing = Boolean(selectedSupplier && !isViewOnly);
      const url = isEditing
        ? `${API_BASE}/suppliers/${selectedSupplier._id}`
        : `${API_BASE}/suppliers`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(
          isEditing
            ? `Supplier "${formData.name}" updated successfully`
            : `Supplier "${formData.name}" added successfully`,
          'success'
        );
        setIsModalOpen(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      } else {
        addToast(data.message || 'Error saving supplier', 'error');
      }
    } catch (err) {
      console.error('Submit supplier error:', err);
      addToast('Network error while saving supplier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(data.message || 'Supplier deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setSupplierToDelete(null);
        fetchSuppliers();
      } else {
        addToast(data.message || 'Failed to delete supplier', 'error');
      }
    } catch (err) {
      console.error('Delete supplier error:', err);
      addToast('Network error while deleting supplier', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Search and Action Bar */}
      <div className="controls-card">
        <div className="controls-row">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search suppliers by company, contact person, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button className="btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              <span>Register Supplier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Table Card */}
      <div className="table-card">
        <div className="table-header-bar">
          <div className="table-header-title">
            <Truck size={20} color="#4f46e5" />
            <h3>Vendors & Suppliers Directory</h3>
            <span className="count-chip">
              {suppliers.length} {suppliers.length === 1 ? 'vendor' : 'vendors'}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading suppliers directory...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Truck size={36} />
            </div>
            <h4>No suppliers found</h4>
            <p>No procurement vendors match your search or none have been registered yet.</p>
            <button className="btn-primary" onClick={handleOpenAdd}>
              Register First Supplier
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Company / Vendor</th>
                  <th>Primary Contact</th>
                  <th>Communication</th>
                  <th>Facility Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup._id}>
                    <td>
                      <div className="product-cell">
                        <span className="product-name">{sup.name}</span>
                        {sup.notes && (
                          <span className="product-desc" title={sup.notes}>
                            {sup.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        {sup.contactPerson}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                        <a
                          href={`mailto:${sup.email}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#4f46e5', textDecoration: 'none' }}
                        >
                          <Mail size={12} />
                          <span>{sup.email}</span>
                        </a>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                          <Phone size={12} />
                          <span>{sup.phone}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      {sup.address ? (
                        <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '240px' }}>
                          <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span className="product-desc" title={sup.address}>{sup.address}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          style={{ color: '#0284c7', backgroundColor: '#f0f9ff' }}
                          onClick={() => handleOpenView(sup)}
                          title="View supplier details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => handleOpenEdit(sup)}
                          title="Edit supplier"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleOpenDelete(sup)}
                          title="Delete supplier"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit / View Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSupplier(null);
          setIsViewOnly(false);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedSupplier}
        isSubmitting={isSubmitting}
        isViewOnly={isViewOnly}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={supplierToDelete ? { _id: supplierToDelete._id, name: supplierToDelete.name, category: 'Supplier' } : null}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SuppliersPage;
