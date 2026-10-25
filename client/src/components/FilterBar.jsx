import React from 'react';
import { Search, Filter, AlertTriangle, X } from 'lucide-react';

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  onlyLowStock,
  setOnlyLowStock
}) => {
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || onlyLowStock;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setOnlyLowStock(false);
  };

  return (
    <div className="controls-card">
      <div className="controls-row">
        {/* Search Input */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="filter-group">
          {/* Category Dropdown */}
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Button */}
          <button
            className={`btn-filter-toggle ${onlyLowStock ? 'active' : ''}`}
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            title="Filter products with stock quantity 5 or less"
          >
            <AlertTriangle size={16} />
            <span>Low Stock (≤ 5)</span>
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              className="btn-secondary"
              onClick={handleClearFilters}
              style={{ padding: '0.65rem 0.9rem', fontSize: '0.8rem' }}
              title="Reset all search and filter conditions"
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
