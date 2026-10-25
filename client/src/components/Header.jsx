import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

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
  }
};

const Header = ({ currentPage = 'dashboard', onOpenAddModal, onNavigateAddProduct, onRefresh, loading }) => {
  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;

  return (
    <header className="top-header">
      <div className="header-title-section">
        <h2>{meta.title}</h2>
        <p>{meta.sub}</p>
      </div>

      <div className="header-actions">
        <button
          className="btn-refresh"
          onClick={onRefresh}
          title="Refresh Data from Database"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
        </button>

        {currentPage !== 'add-product' && (
          <button className="btn-primary" onClick={onNavigateAddProduct || onOpenAddModal}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
