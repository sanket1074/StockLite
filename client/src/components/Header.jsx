
import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Bell,
  CalendarDays,
  ChevronDown,
  Package,
  ShoppingCart,
  ShoppingBag,
  ReceiptText,
  X
} from 'lucide-react';

const PAGE_META = {
  dashboard: {
    title: 'StockLite ERP Dashboard',
    sub: 'Real-time enterprise overview & operational metrics'
  },
  products: {
    title: 'Product Inventory Catalog',
    sub: 'Manage products, stock levels, unit pricing, and status'
  },
  'add-product': {
    title: 'New Product Registration',
    sub: 'Add and configure a new SKU into the inventory'
  },
  categories: {
    title: 'Category Master Management',
    sub: 'Organize products into distinct classification departments'
  },
  suppliers: {
    title: 'Supplier & Vendor Directory',
    sub: 'Manage vendor details, procurement contacts, and terms'
  },
  sales: {
    title: 'Sales Terminal (POS)',
    sub: 'Create itemized customer sales with automatic stock deduction'
  },
  purchases: {
    title: 'Purchase Orders & Inbound Goods',
    sub: 'Procurement orders and stock replenishment from vendors'
  },
  invoices: {
    title: 'Receipts & Invoices Registry',
    sub: 'Historical sales invoices, payment tracking, and printable receipts'
  },
  reports: {
    title: 'ERP Analytics & Reports',
    sub: 'Valuation, revenue summaries, and inventory movement intelligence'
  },
  'stock-alerts': {
    title: 'Low Stock & Depletion Surveillance',
    sub: 'Items reaching reorder thresholds (≤ 5 units)'
  },
  settings: {
    title: 'ERP System Settings',
    sub: 'Store profile, currency symbols, and business preferences'
  },
  'data-export': {
    title: 'Data Export Center',
    sub: 'Export inventory and business records'
  },
  notifications: {
    title: 'Notification Center',
    sub: 'Review low-stock and operational alerts'
  },
  'print-reports': {
    title: 'Print Reports',
    sub: 'Prepare inventory reports for printing'
  },
  'stock-history': {
    title: 'Stock Adjustment History',
    sub: 'Review inventory quantity adjustments'
  },
  customers: {
    title: 'Customer Directory',
    sub: 'Manage customer information'
  }
};

const Header = ({
  currentPage = 'dashboard',
  onOpenAddModal,
  onNavigateAddProduct,
  onRefresh,
  loading,
  loggedInUser,
  onLogout,
  onNavigate,
  lowStockCount = 0
}) => {
  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  const currentDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const navigate = (page) => {
    if (onNavigate) onNavigate(page);
    setQuickOpen(false);
    setSearchOpen(false);
    setSearchText('');
  };

  const quickActions = [
    { label: 'Add Product', icon: Package, page: 'add-product' },
    { label: 'New Sale', icon: ShoppingCart, page: 'sales' },
    { label: 'Purchase Orders', icon: ShoppingBag, page: 'purchases' },
    { label: 'View Invoices', icon: ReceiptText, page: 'invoices' }
  ];

  const searchPages = [
    { label: 'Dashboard', page: 'dashboard', keywords: 'home overview' },
    { label: 'All Products', page: 'products', keywords: 'inventory stock item' },
    { label: 'Add Product', page: 'add-product', keywords: 'new item sku' },
    { label: 'Categories', page: 'categories', keywords: 'groups classification' },
    { label: 'Suppliers', page: 'suppliers', keywords: 'vendors procurement' },
    { label: 'Stock Alerts', page: 'stock-alerts', keywords: 'low stock shortage' },
    { label: 'Sales (POS)', page: 'sales', keywords: 'sell checkout point of sale' },
    { label: 'Purchase Orders', page: 'purchases', keywords: 'buy procurement order' },
    { label: 'Receipts / Invoices', page: 'invoices', keywords: 'bill receipt payment' },
    { label: 'Reports & Analytics', page: 'reports', keywords: 'analytics summary' },
    { label: 'Administration', page: 'settings', keywords: 'settings business profile' },
    { label: 'Data Export', page: 'data-export', keywords: 'download csv excel' },
    { label: 'Notifications', page: 'notifications', keywords: 'alerts messages' },
    { label: 'Print Reports', page: 'print-reports', keywords: 'print report paper' },
    { label: 'Stock Adjustment History', page: 'stock-history', keywords: 'adjustment movement history' },
    { label: 'Customers', page: 'customers', keywords: 'customer client' }
  ];

  const searchResults = searchPages.filter((item) => {
    const text = `${item.label} ${item.keywords}`.toLowerCase();
    return text.includes(searchText.trim().toLowerCase());
  });

  return (
    <header className="top-header">
      <div className="header-title-section">
        <h2>{meta.title}</h2>
        <p>{meta.sub}</p>
      </div>

      <div className="header-actions">
        <div className="header-date">
          <CalendarDays size={16} />
          <span>{currentDate}</span>
        </div>

        <div className="header-search-container">
          <button
            type="button"
            className="header-icon-button"
            title="Global Search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setQuickOpen(false);
            }}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {searchOpen && (
            <div className="header-popover header-search-popover">
              <input
                autoFocus
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search modules..."
                aria-label="Search modules"
              />

              <div className="header-search-results">
                {searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.page}
                    onClick={() => navigate(item.page)}
                  >
                    <Search size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}

                {searchResults.length === 0 && (
                  <p>No matching modules found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="header-icon-button header-notification-button"
          title={`${lowStockCount} low-stock alerts`}
          onClick={() => navigate('stock-alerts')}
        >
          <Bell size={18} />
          {lowStockCount > 0 && (
            <span className="header-notification-count">
              {lowStockCount}
            </span>
          )}
        </button>

        <div className="header-quick-container">
          <button
            type="button"
            className="header-quick-button"
            onClick={() => {
              setQuickOpen(!quickOpen);
              setSearchOpen(false);
            }}
          >
            <Plus size={17} />
            <span>Quick Actions</span>
            <ChevronDown size={15} />
          </button>

          {quickOpen && (
            <div className="header-popover header-quick-popover">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    type="button"
                    key={action.page}
                    onClick={() => {
                      if (action.page === 'add-product' && onNavigateAddProduct) {
                        onNavigateAddProduct();
                        setQuickOpen(false);
                      } else {
                        navigate(action.page);
                      }
                    }}
                  >
                    <Icon size={16} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-refresh"
          onClick={onRefresh}
          title="Refresh Data from Database"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
        </button>

        {currentPage !== 'add-product' && (
          <button
            className="btn-primary"
            onClick={onNavigateAddProduct || onOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}

        <div className="header-user">
          <div className="header-avatar">
            {(loggedInUser || 'D').charAt(0).toUpperCase()}
          </div>

          <div className="header-user-info">
            <span className="header-user-name">
              {loggedInUser || 'Demo User'}
            </span>
            <span className="header-user-role">Demo Account</span>
          </div>

          <button
            className="btn-logout"
            onClick={onLogout}
            title="Logout"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
