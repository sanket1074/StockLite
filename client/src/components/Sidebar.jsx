import React from 'react';
import { Package, LayoutDashboard, AlertCircle, Layers, ShieldCheck } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, lowStockCount = 0, totalProducts = 0 }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Package size={22} color="#fff" />
        </div>
        <div className="brand-text">
          <h1>StockLite</h1>
          <span className="brand-badge">Inventory Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <LayoutDashboard size={18} />
          <span>All Products</span>
          <span className="nav-badge">{totalProducts}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'lowStock' ? 'active' : ''}`}
          onClick={() => setActiveTab('lowStock')}
        >
          <AlertCircle size={18} />
          <span>Low Stock Alerts</span>
          {lowStockCount > 0 && (
            <span className="nav-badge" style={{ backgroundColor: '#f59e0b', color: '#fff' }}>
              {lowStockCount}
            </span>
          )}
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="academic-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <ShieldCheck size={16} color="#818cf8" />
            <div className="academic-title">MCA Assessment</div>
          </div>
          <div className="academic-sub">StockLite MERN v1.0</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
