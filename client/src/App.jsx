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
import AddProductPage from './components/AddProductPage';
import CategoriesPage from './components/CategoriesPage';
import SuppliersPage from './components/SuppliersPage';
import PlaceholderPage from './components/PlaceholderPage';
import {
  FolderTree,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  AlertTriangle,
  Package,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import './App.css';

const API_BASE = '/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalUnits: 0,
    totalValue: 0,
    lowStockCount: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);

  // Search and Filters for Products Page
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal states (Quick Add / Edit)
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
      if (onlyLowStock || currentPage === 'stock-alerts') params.append('lowStock', 'true');

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
  }, [searchTerm, selectedCategory, onlyLowStock, currentPage]);

  useEffect(() => {
    checkHealth();
    fetchProducts();
  }, [checkHealth, fetchProducts]);

  // Navigate between pages
  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    if (pageId === 'stock-alerts') {
      setOnlyLowStock(true);
    } else if (pageId === 'products') {
      setOnlyLowStock(false);
    }
  };

  // Create or Update Product
  const handleProductSubmit = async (formData) => {
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
          isEditing
            ? `"${formData.name}" updated successfully!`
            : `"${formData.name}" added to inventory!`
        );
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
        if (currentPage === 'add-product') {
          setCurrentPage('products');
        }
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

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Render content based on currentPage
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="page-container">
            {/* KPI Summary Cards */}
            <StatCards
              summary={summary}
              activeTab={onlyLowStock ? 'lowStock' : 'all'}
              onSelectLowStock={() => handleNavigate('stock-alerts')}
            />

            {/* Quick ERP Action Cards */}
            <div className="stats-grid" style={{ marginTop: '0.25rem' }}>
              <div
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #4f46e5' }}
                onClick={() => handleNavigate('products')}
              >
                <div className="stat-info">
                  <span className="stat-label">Product Catalog</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Browse Inventory</span>
                  <span className="stat-subtext">Manage SKUs, prices & stock</span>
                </div>
                <ArrowRight size={20} color="#4f46e5" />
              </div>

              <div
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
                onClick={() => handleNavigate('add-product')}
              >
                <div className="stat-info">
                  <span className="stat-label">Stock Entry</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Add New Product</span>
                  <span className="stat-subtext">Register a new SKU</span>
                </div>
                <PlusCircle size={20} color="#10b981" />
              </div>

              <div
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
                onClick={() => handleNavigate('sales')}
              >
                <div className="stat-info">
                  <span className="stat-label">Point of Sale</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sales Terminal</span>
                  <span className="stat-subtext">Phase 3 module preview</span>
                </div>
                <ShoppingCart size={20} color="#f59e0b" />
              </div>

              <div
                className="stat-card"
                style={{ cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}
                onClick={() => handleNavigate('purchases')}
              >
                <div className="stat-info">
                  <span className="stat-label">Procurement</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Purchase Orders</span>
                  <span className="stat-subtext">Phase 4 module preview</span>
                </div>
                <ShoppingBag size={20} color="#8b5cf6" />
              </div>
            </div>

            {/* Recent Inventory Snapshot Table */}
            <div className="table-card">
              <div className="table-header-bar">
                <div className="table-header-title">
                  <h3>Recent Inventory Items</h3>
                  <span className="count-chip">Showing latest {products.slice(0, 5).length} items</span>
                </div>
                <button className="btn-secondary" onClick={() => handleNavigate('products')} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  <span>View All in Inventory</span>
                  <ArrowRight size={14} />
                </button>
              </div>
              <ProductTable
                products={products.slice(0, 5)}
                loading={loading}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onOpenAddModal={() => handleNavigate('add-product')}
              />
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="page-container">
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={summary.categories || []}
              onlyLowStock={onlyLowStock}
              setOnlyLowStock={setOnlyLowStock}
            />
            <ProductTable
              products={products}
              loading={loading}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onOpenAddModal={() => handleNavigate('add-product')}
            />
          </div>
        );

      case 'add-product':
        return (
          <AddProductPage
            onSubmit={handleProductSubmit}
            onCancel={() => handleNavigate('products')}
            isSubmitting={isSubmitting}
          />
        );

      case 'stock-alerts':
        return (
          <div className="page-container">
            <div className="placeholder-notice" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="notice-icon">
                <AlertTriangle size={22} color="#d97706" />
              </div>
              <div className="notice-text">
                <strong style={{ color: '#92400e' }}>
                  Low Stock Surveillance Threshold: Quantity ≤ 5 Units
                </strong>
                <p style={{ color: '#b45309' }}>
                  The items listed below have reached or fallen below the minimum safety buffer threshold.
                  In Phase 4, you will be able to generate 1-click Purchase Orders directly from this screen.
                </p>
              </div>
            </div>

            <ProductTable
              products={products.filter((p) => (p.quantity || 0) <= 5)}
              loading={loading}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onOpenAddModal={() => handleNavigate('add-product')}
            />
          </div>
        );

      case 'categories':
        return (
          <CategoriesPage
            onCategoryChanged={fetchProducts}
            addToast={addToast}
          />
        );

      case 'suppliers':
        return (
          <SuppliersPage
            addToast={addToast}
          />
        );

      case 'sales':
        return (
          <PlaceholderPage
            title="Sales Terminal (POS)"
            icon={ShoppingCart}
            phase="Phase 3: Sales & Invoicing"
            description="Point of Sale checkout interface with automatic stock reduction"
            plannedFeatures={[
              'Interactive cart builder with instant SKU search and price lookups',
              'Real-time inventory availability validation (prevents overselling)',
              'Automatic inventory reduction upon sale completion',
              'Instant generation of numbered tax invoice / receipt'
            ]}
            onNavigate={handleNavigate}
          />
        );

      case 'purchases':
        return (
          <PlaceholderPage
            title="Purchase Orders & Inbound Goods"
            icon={ShoppingBag}
            phase="Phase 4: Purchase Orders"
            description="Vendor procurement order management with inventory replenishment"
            plannedFeatures={[
              'Draft procurement purchase orders with line-item unit costs',
              'Vendor selection linked to the Suppliers master directory',
              'Order status workflow: Draft -> Ordered -> Received',
              'Automatic inventory stock increment only when marked "Received"'
            ]}
            onNavigate={handleNavigate}
          />
        );

      case 'invoices':
        return (
          <PlaceholderPage
            title="Receipts & Invoices Registry"
            icon={Receipt}
            phase="Phase 3: Sales & Invoicing"
            description="Persistent historical invoice ledger with print-ready receipt generator"
            plannedFeatures={[
              'Unique sequential invoice identifiers (e.g. INV-2026-0001)',
              'Full line-item breakdown with customer info, taxes, and totals',
              'Print-ready professional invoice modal (formatted for window.print())',
              'Safe invoice voiding/cancellation with automatic stock return'
            ]}
            onNavigate={handleNavigate}
          />
        );

      case 'reports':
        return (
          <PlaceholderPage
            title="ERP Analytics & Reports"
            icon={BarChart3}
            phase="Phase 5: Reports & Intelligence"
            description="Executive business intelligence, valuation, and sales analytics"
            plannedFeatures={[
              'Total Inventory Valuation report across departments',
              'Sales revenue, transaction volume, and margin breakdown',
              'Stock movement ledger (sales depletion vs. inbound PO receipts)',
              'Fast-moving vs. slow-moving stock diagnostics'
            ]}
            onNavigate={handleNavigate}
          />
        );

      case 'settings':
        return (
          <PlaceholderPage
            title="ERP System Settings"
            icon={SettingsIcon}
            phase="Phase 5: Settings"
            description="Store identity, currency tokens, and business parameters"
            plannedFeatures={[
              'Store / Company legal name, contact phone, and billing address',
              'Currency symbol preference (₹ INR default, $, €)',
              'Default tax percentage and invoice notes template',
              'Low-stock threshold customization (default: 5 units)',
              'Non-destructive sample data seeder trigger'
            ]}
            onNavigate={handleNavigate}
          />
        );

      default:
        return <div>Unknown Page</div>;
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Shared ERP Sidebar with 11 Pages */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        lowStockCount={summary.lowStockCount}
        totalProducts={summary.totalProducts}
      />

      {/* Main ERP Layout Container */}
      <div className="main-wrapper">
        <Header
          currentPage={currentPage}
          onOpenAddModal={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onNavigateAddProduct={() => handleNavigate('add-product')}
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

          {/* Active Page View */}
          {renderPageContent()}
        </main>
      </div>

      {/* Quick Add / Edit Product Modal (Preserved for quick edits from tables) */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
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
