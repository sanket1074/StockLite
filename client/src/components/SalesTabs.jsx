
import React from 'react';
import { ShoppingCart, ReceiptText } from 'lucide-react';

const tabs = [
  { id: 'sales', label: 'Sales (POS)', icon: ShoppingCart },
  { id: 'invoices', label: 'Receipts / Invoices', icon: ReceiptText }
];

export default function SalesTabs({ currentPage, onNavigate }) {
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
