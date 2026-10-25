import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, FolderTree, Package, AlertCircle } from 'lucide-react';
import CategoryModal from './CategoryModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const API_BASE = '/api';

const CategoriesPage = ({ onCategoryChanged, addToast }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Protected deletion warning state
  const [protectedWarning, setProtectedWarning] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`${API_BASE}/categories?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setCategories(data.data || []);
      } else {
        addToast(data.message || 'Failed to fetch categories', 'error');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      addToast('Cannot connect to server to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (category) => {
    if (category.productCount > 0) {
      setProtectedWarning({
        name: category.name,
        count: category.productCount
      });
      return;
    }
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingCategory);
      const url = isEditing
        ? `${API_BASE}/categories/${editingCategory._id}`
        : `${API_BASE}/categories`;
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
            ? `Category "${formData.name}" updated successfully`
            : `Category "${formData.name}" created successfully`,
          'success'
        );
        setIsModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
        if (onCategoryChanged) onCategoryChanged();
      } else {
        addToast(data.message || 'Error saving category', 'error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      addToast('Network error while saving category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(data.message || 'Category deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
        if (onCategoryChanged) onCategoryChanged();
      } else {
        addToast(data.message || 'Cannot delete category', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Network error while deleting category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
              placeholder="Search categories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button className="btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              <span>Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Protected Deletion Warning Modal */}
      {protectedWarning && (
        <div className="modal-overlay" onClick={() => setProtectedWarning(null)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-content">
              <div className="delete-icon-circle" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                <AlertCircle size={28} />
              </div>
              <h3>Cannot Delete Category</h3>
              <p>
                Category <strong style={{ color: '#0f172a' }}>"{protectedWarning.name}"</strong> cannot be deleted because it is currently assigned to{' '}
                <strong style={{ color: '#d97706' }}>{protectedWarning.count} product(s)</strong> in your inventory.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                To preserve inventory integrity, please reassign or delete the associated products first.
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setProtectedWarning(null)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table Card */}
      <div className="table-card">
        <div className="table-header-bar">
          <div className="table-header-title">
            <FolderTree size={20} color="#4f46e5" />
            <h3>Merchandise Categories</h3>
            <span className="count-chip">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <FolderTree size={36} />
            </div>
            <h4>No categories found</h4>
            <p>No merchandise categories match your search or none have been added yet.</p>
            <button className="btn-primary" onClick={handleOpenAdd}>
              Add First Category
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Assigned Products</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        {cat.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {cat.description || '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="stock-badge"
                        style={{
                          backgroundColor: cat.productCount > 0 ? '#eef2ff' : '#f8fafc',
                          color: cat.productCount > 0 ? '#4338ca' : '#94a3b8',
                          border: `1px solid ${cat.productCount > 0 ? '#c7d2fe' : '#e2e8f0'}`
                        }}
                      >
                        <Package size={13} />
                        <span>{cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {formatDate(cat.createdAt)}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn edit"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit category"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleOpenDelete(cat)}
                          title={cat.productCount > 0 ? 'Assigned to products' : 'Delete category'}
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

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={categoryToDelete ? { _id: categoryToDelete._id, name: categoryToDelete.name, category: 'Category' } : null}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CategoriesPage;
