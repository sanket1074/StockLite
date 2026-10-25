import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import FilterBar from './components/FilterBar';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import DatabaseAlert from './components/DatabaseAlert';
import Toast from './components/Toast';
import './App.css';

const API_BASE = '/api';

function App() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalUnits: 0,
    totalValue: 0,
    lowStockCount: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null); // 'Connected', 'Disconnected', etc.

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'lowStock'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check health and MongoDB status
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.database?.status || 'Unknown');
      } else {
        setDbStatus('Disconnected');
      }
    } catch (err) {
      setDbStatus('Disconnected');
    }
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (onlyLowStock || activeTab === 'lowStock') params.append('lowStock', 'true');

      const response = await fetch(`${API_BASE}/products?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setProducts(result.data || []);
        if (result.summary) {
          setSummary(result.summary);
        }
        setDbStatus('Connected');
      } else {
        if (response.status === 503) {
          setDbStatus('Disconnected');
        }
        addToast(result.message || 'Failed to fetch products', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setDbStatus('Disconnected');
      addToast('Cannot connect to server. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, onlyLowStock, activeTab]);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchProducts();
  }, [checkHealth, fetchProducts]);

  // Handle Tab Switch (All vs Low Stock)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'lowStock') {
      setOnlyLowStock(true);
    } else {
      setOnlyLowStock(false);
    }
  };

  // Create or Update Product
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing
        ? `${API_BASE}/products/${editingProduct._id}`
        : `${API_BASE}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast(
          isEditing ? `"${formData.name}" updated successfully!` : `"${formData.name}" added to inventory!`
        );
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        addToast(data.message || 'Error saving product', 'error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      addToast('Network error while saving product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteConfirm = async (productId) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(data.message || 'Product deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        addToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Network error while deleting product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="app-layout">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        lowStockCount={summary.lowStockCount}
        totalProducts={summary.totalProducts}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          onOpenAddModal={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onRefresh={() => {
            checkHealth();
            fetchProducts();
          }}
          loading={loading}
        />

        <main className="content-area">
          {/* Database Alert Banner if MongoDB is disconnected */}
          <DatabaseAlert
            dbStatus={dbStatus}
            onRetry={() => {
              checkHealth();
              fetchProducts();
            }}
          />

          {/* Metric Summary Cards */}
          <StatCards
            summary={summary}
            activeTab={activeTab}
            onSelectLowStock={() => handleTabChange('lowStock')}
          />

          {/* Search, Filter, and View Controls */}
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={summary.categories || []}
            onlyLowStock={onlyLowStock}
            setOnlyLowStock={(val) => {
              setOnlyLowStock(val);
              setActiveTab(val ? 'lowStock' : 'all');
            }}
          />

          {/* Inventory Table */}
          <ProductTable
            products={products}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onOpenAddModal={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          />
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={productToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default App;
