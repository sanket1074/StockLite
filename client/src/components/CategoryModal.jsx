import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length > 60) {
      newErrors.name = 'Category name cannot exceed 60 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim()
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit Category' : 'Add New Category'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Category Name <span className="req">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Industrial Automation & Robotics"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                autoFocus
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Scope of merchandise, department tags, or handling criteria..."
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
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
