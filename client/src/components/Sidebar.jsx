
import React, { useState } from 'react';
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
  ShieldCheck,
  ChevronDown,
  Download,
  Bell,
  Printer,
  History,
  Users
} from 'lucide-react';

const Sidebar = ({
  currentPage,
  onNavigate,
  lowStockCount = 0,
  totalProducts = 0
}) => {
  const navSections = [
    {
      label: 'CORE',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      label: 'INVENTORY MANAGEMENT',
      items: [
        {
          id: 'inventory',
          label: 'Inventory',
          icon: Package,
          children: [
            {
              id: 'products',
              label: 'All Products',
              icon: Package,
              badge: totalProducts
            },
            {
              id: 'add-product',
              label: 'Add Product',
              icon: PlusCircle
            },
            {
              id: 'categories',
              label: 'Categories',
              icon: FolderTree
            },
            {
              id: 'stock-alerts',
              label: 'Stock Alerts',
              icon: AlertTriangle,
              badge: lowStockCount > 0 ? lowStockCount : null,
              badgeColor: '#f59e0b'
            },
          
          ]
        }
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        {
          id: 'sales-group',
          label: 'Sales & Billing',
          icon: ShoppingCart,
          children: [
            {
              id: 'sales',
              label: 'Sales (POS)',
              icon: ShoppingCart
            },
            {
              id: 'invoices',
              label: 'Receipts / Invoices',
              icon: Receipt
            },
            {
              id: 'customers',
              label: 'Customers',
              icon: Users
            }
          ]
        },
        {
          id: 'procurement-group',
          label: 'Procurement',
          icon: Truck,
          children: [
            {
              id: 'suppliers',
              label: 'Suppliers',
              icon: Truck
            },
            {
              id: 'purchases',
              label: 'Purchase Orders',
              icon: ShoppingBag
            }
          ]
        }
      ]
    },
    {
      label: 'ANALYTICS & CONFIG',
      items: [
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: BarChart3
        },
        {
          id: 'data-export',
          label: 'Data Export',
          icon: Download
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: lowStockCount > 0 ? lowStockCount : null,
          badgeColor: '#6366f1'
        },
        {
          id: 'print-reports',
          label: 'Print Reports',
          icon: Printer
        },
        {
          id: 'settings',
          label: 'Administration',
          icon: Settings
        }
      ]
    }
  ];

  const getInitialExpanded = () => {
    const expanded = [];

    navSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.some(child => child.id === currentPage)) {
          expanded.push(item.id);
        }
      });
    });

    return expanded;
  };

  const [expandedMenus, setExpandedMenus] = useState(getInitialExpanded);

  const toggleMenu = (menuId) => {
    setExpandedMenus(previous =>
      previous.includes(menuId)
        ? previous.filter(id => id !== menuId)
        : [...previous, menuId]
    );
  };

  const renderItem = (item) => {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);
    const isActive = currentPage === item.id;

    const childIsActive = hasChildren &&
      item.children.some(child =>
        child.id === currentPage ||
        child.children?.some(nested => nested.id === currentPage)
      );

    const isExpanded = expandedMenus.includes(item.id);

    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <button
            type="button"
            className={`nav-item nav-parent ${
              childIsActive ? 'active-parent' : ''
            }`}
            onClick={() => toggleMenu(item.id)}
            aria-expanded={isExpanded}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            <ChevronDown
              size={16}
              className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}
            />
          </button>

          {isExpanded && (
            <div className="nav-submenu">
              {item.children.map(child => renderItem(child))}
            </div>
          )}
        </React.Fragment>
      );
    }

    return (
      <button
        type="button"
        key={item.id}
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={() => onNavigate(item.id)}
      >
        <Icon size={17} />
        <span>{item.label}</span>

        {item.badge !== undefined && item.badge !== null && (
          <span
            className="nav-badge"
            style={
              item.badgeColor
                ? {
                    backgroundColor: item.badgeColor,
                    color: '#fff'
                  }
                : {}
            }
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

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

      <nav
        className="sidebar-nav"
        style={{ overflowY: 'auto' }}
      >
        {navSections.map(section => (
          <div
            key={section.label}
            className="nav-section-group"
          >
            <span className="nav-section-label">
              {section.label}
            </span>

            {section.items.map(item => renderItem(item))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="academic-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.2rem'
            }}
          >
            <ShieldCheck size={16} color="#818cf8" />
            <div className="academic-title">
              StockLite ERP v2.0
            </div>
          </div>

          <div className="academic-sub">
            15 Navigation Modules
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
