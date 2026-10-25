import React from 'react';
import { Package, Layers, IndianRupee, AlertTriangle } from 'lucide-react';

const StatCards = ({ summary = {}, onSelectLowStock, activeTab }) => {
  const {
    totalProducts = 0,
    totalUnits = 0,
    totalValue = 0,
    lowStockCount = 0
  } = summary;

  // Format currency in Indian Rupees format (e.g. ₹ 1,25,000.00)
  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(totalValue);

  return (
    <div className="stats-grid">
      {/* 1. Total Products */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{totalProducts}</span>
          <span className="stat-subtext">Active catalog items</span>
        </div>
        <div className="stat-icon-wrapper stat-icon-indigo">
          <Package size={24} />
        </div>
      </div>

      {/* 2. Total Units in Stock */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Total Units</span>
          <span className="stat-value">{totalUnits.toLocaleString('en-IN')}</span>
          <span className="stat-subtext">Physical units counted</span>
        </div>
        <div className="stat-icon-wrapper stat-icon-emerald">
          <Layers size={24} />
        </div>
      </div>

      {/* 3. Total Inventory Value */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Inventory Value</span>
          <span className="stat-value">{formattedValue}</span>
          <span className="stat-subtext">Calculated as price × quantity</span>
        </div>
        <div className="stat-icon-wrapper stat-icon-indigo" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
          <IndianRupee size={24} />
        </div>
      </div>

      {/* 4. Low-Stock Products */}
      <div
        className="stat-card"
        style={{
          cursor: 'pointer',
          border: activeTab === 'lowStock' ? '2px solid #f59e0b' : '1px solid var(--border-card)'
        }}
        onClick={onSelectLowStock}
        title="Click to view low stock items (<= 5 units)"
      >
        <div className="stat-info">
          <span className="stat-label">Low Stock Alert</span>
          <span className="stat-value" style={{ color: lowStockCount > 0 ? '#d97706' : 'var(--text-main)' }}>
            {lowStockCount}
          </span>
          <span className="stat-subtext">Quantity ≤ 5 units</span>
        </div>
        <div className="stat-icon-wrapper stat-icon-amber">
          <AlertTriangle size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCards;
