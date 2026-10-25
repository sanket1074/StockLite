import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

const Header = ({ onOpenAddModal, onRefresh, loading }) => {
  return (
    <header className="top-header">
      <div className="header-title-section">
        <h2>StockLite Dashboard</h2>
        <p>Real-time Inventory Management & Control</p>
      </div>

      <div className="header-actions">
        <button
          className="btn-refresh"
          onClick={onRefresh}
          title="Refresh Data"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
        </button>

        <button className="btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
