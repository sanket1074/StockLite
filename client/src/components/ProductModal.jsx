import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Stationery',
  'Packaging Materials',
  'Office Supplies',
  'Computers & Accessories',
  'Hardware & Tools',
  'Healthcare'
];

const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) => {
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const fetchedNames = data.data.map(c => c.name);
          setCategoriesList([...new Set([...fetchedNames, ...DEFAULT_CATEGORIES])]);
        }
      })
      .catch(err => console.error('Error fetching categories in ProductModal:', err));
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price !== undefined ? initialData.price.toString() : '',
        quantity: initialData.quantity !== undefined ? initialData.quantity.toString() : '',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length > 120) {
      newErrors.name = 'Product name cannot exceed 120 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number greater than or equal to 0';
    }

    if (formData.quantity === '' || formData.quantity === null) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a valid integer greater than or equal to 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
      description: formData.description.trim()
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Preview calculated inventory value
  const numPrice = parseFloat(formData.price) || 0;
  const numQty = parseInt(formData.quantity, 10) || 0;
  const calculatedTotal = (numPrice * numQty).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Product Name */}
            <div className="form-group">
              <label>
                Product Name <span className="req">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Wireless Ergonomic Mouse"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                autoFocus
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label>
                Category <span className="req">*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  list="category-suggestions"
                  className={`form-input ${errors.category ? 'has-error' : ''}`}
                  placeholder="Select or enter category..."
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                />
                <datalist id="category-suggestions">
                  {categoriesList.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            {/* Price & Quantity Grid */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  Unit Price (₹) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.price ? 'has-error' : ''}`}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>
                  Quantity (Units) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className={`form-input ${errors.quantity ? 'has-error' : ''}`}
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                />
                {errors.quantity && <span className="field-error">{errors.quantity}</span>}
              </div>
            </div>

            {/* Calculated Value Preview */}
            <div className="form-calc-banner">
              <span className="form-calc-label">Total Value Preview (Price × Qty):</span>
              <span className="form-calc-val">₹ {Number(calculatedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Product specifications, location shelf, vendor code..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
