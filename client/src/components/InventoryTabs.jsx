
import React from 'react';
import { Package, FolderTree, AlertTriangle } from 'lucide-react';

const tabs = [
  { id: 'products', label: 'All Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'stock-alerts', label: 'Stock Alerts', icon: AlertTriangle }
];

export default function InventoryTabs({ currentPage, onNavigate }) {
  return (
    <div className="erp-tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = currentPage === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`erp-tab ${active ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={17} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
