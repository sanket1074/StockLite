import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const SupplierModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  isViewOnly = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier company name is required';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Supplier name cannot exceed 100 characters';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email format (e.g. name@vendor.com)';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewOnly) {
      onClose();
      return;
    }
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim()
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
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {isViewOnly
              ? 'Supplier Details'
              : initialData
              ? 'Edit Supplier'
              : 'Register New Supplier'}
          </h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Company / Supplier Name {!isViewOnly && <span className="req">*</span>}
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Apex Tech Solutions Ltd"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isViewOnly}
                autoFocus={!isViewOnly}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Contact Person {!isViewOnly && <span className="req">*</span>}
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.contactPerson ? 'has-error' : ''}`}
                  placeholder="e.g. Vikram Sharma"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  disabled={isViewOnly}
                />
                {errors.contactPerson && <span className="field-error">{errors.contactPerson}</span>}
              </div>

              <div className="form-group">
                <label>
                  Phone Number {!isViewOnly && <span className="req">*</span>}
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.phone ? 'has-error' : ''}`}
                  placeholder="+91 98201 12345"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isViewOnly}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>
                Email Address {!isViewOnly && <span className="req">*</span>}
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="sales@apextech.in"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isViewOnly}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Facility / Billing Address</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Industrial Plot, City, State, PIN..."
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-group">
              <label>Procurement Terms & Notes</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Standard payment terms, minimum order quantities, lead times..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Check size={16} />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : initialData
                    ? 'Update Supplier'
                    : 'Save Supplier'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
