import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Truck,
  AlertTriangle,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  BarChart3,
  Settings,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate, lowStockCount = 0, totalProducts = 0 }) => {
  const navSections = [
    {
      label: 'Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'All Products', icon: Package, badge: totalProducts },
        { id: 'add-product', label: 'Add Product', icon: PlusCircle }
      ]
    },
    {
      label: 'Inventory & Master',
      items: [
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'suppliers', label: 'Suppliers', icon: Truck },
        {
          id: 'stock-alerts',
          label: 'Stock Alerts',
          icon: AlertTriangle,
          badge: lowStockCount > 0 ? lowStockCount : null,
          badgeColor: '#f59e0b'
        }
      ]
    },
    {
      label: 'Transactions',
      items: [
        { id: 'sales', label: 'Sales (POS)', icon: ShoppingCart },
        { id: 'purchases', label: 'Purchase Orders', icon: ShoppingBag },
        { id: 'invoices', label: 'Receipts / Invoices', icon: Receipt }
      ]
    },
    {
      label: 'Intelligence & Config',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Package size={22} color="#fff" />
        </div>
        <div className="brand-text">
          <h1>StockLite ERP</h1>
          <span className="brand-badge">Enterprise Edition</span>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto' }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="nav-section-group">
            <span className="nav-section-label">{section.label}</span>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className="nav-badge"
                      style={item.badgeColor ? { backgroundColor: item.badgeColor, color: '#fff' } : {}}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="academic-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <ShieldCheck size={16} color="#818cf8" />
            <div className="academic-title">StockLite ERP v2.0</div>
          </div>
          <div className="academic-sub">11 Integrated Modules</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
