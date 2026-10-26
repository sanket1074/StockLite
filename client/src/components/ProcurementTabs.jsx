
import React from 'react';
import { Truck, ShoppingBag } from 'lucide-react';

const tabs = [
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'purchases', label: 'Purchase Orders', icon: ShoppingBag }
];

export default function ProcurementTabs({ currentPage, onNavigate }) {
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
