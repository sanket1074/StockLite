
import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, Plus, Search, Pencil, Trash2, X,
  Phone, Mail, MapPin, RefreshCw
} from 'lucide-react';

const API = '/api/customers';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  async function loadCustomers() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load customers.');
      }

      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err) {
      setError(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter(customer =>
      [customer.name, customer.phone, customer.email, customer.address]
        .some(value => String(value || '').toLowerCase().includes(term))
    );
  }, [customers, search]);

  function openAddForm() {
    setEditingId(null);
    setForm({ name: '', phone: '', email: '', address: '' });
    setError('');
    setModalOpen(true);
  }

  function openEditForm(customer) {
    setEditingId(customer._id);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || ''
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not save customer.');
      }

      setModalOpen(false);
      await loadCustomers();
    } catch (err) {
      setError(err.message || 'Could not save customer.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer) {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${customer._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete customer.');
      }

      await loadCustomers();
    } catch (err) {
      setError(err.message || 'Could not delete customer.');
    }
  }

  return (
    <div className="page-container customers-page">
      <div className="customers-heading">
        <div>
          <h2>Customers</h2>
          <p>Manage your customer directory and contact information.</p>
        </div>

        <button className="btn-primary" onClick={openAddForm}>
          <Plus size={17} /> Add Customer
        </button>
      </div>

      <div className="customers-summary">
        <div className="customers-summary-icon">
          <Users size={22} />
        </div>
        <div>
          <span>Total Customers</span>
          <h3>{customers.length}</h3>
        </div>
      </div>

      <div className="customers-toolbar">
        <Search size={18} />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search by name, phone, email or address..."
        />
        <button
          className="btn-secondary"
          onClick={loadCustomers}
          title="Refresh customers"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="customers-error" role="alert">
          {error}
        </div>
      )}

      <div className="customers-table-card">
        <div className="customers-table-title">
          <h3>Customer Directory</h3>
          <span>{filteredCustomers.length} customers</span>
        </div>

        {loading ? (
          <p className="customers-empty">Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <div className="customers-empty">
            <Users size={34} />
            <h3>{search ? 'No matching customers' : 'No customers yet'}</h3>
            <p>
              {search
                ? 'Try another search term.'
                : 'Add your first customer to get started.'}
            </p>
          </div>
        ) : (
          <div className="customers-table-scroll">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer._id}>
                    <td>
                      <div className="customer-name-cell">
                        <span className="customer-avatar">
                          {(customer.name || '?').charAt(0).toUpperCase()}
                        </span>
                        <strong>{customer.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="customer-contact">
                        <Phone size={14} /> {customer.phone}
                      </span>
                    </td>
                    <td>
                      {customer.email ? (
                        <span className="customer-contact">
                          <Mail size={14} /> {customer.email}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {customer.address ? (
                        <span className="customer-contact">
                          <MapPin size={14} /> {customer.address}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="customer-actions">
                        <button
                          className="customer-edit-btn"
                          title="Edit customer"
                          onClick={() => openEditForm(customer)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="customer-delete-btn"
                          title="Delete customer"
                          onClick={() => handleDelete(customer)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="customer-modal-overlay">
          <div className="customer-modal">
            <div className="customer-modal-heading">
              <div>
                <h3>{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
                <p>Enter the customer's contact details.</p>
              </div>
              <button
                className="customer-close-btn"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Customer Name *
                <input
                  required
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                />
              </label>

              <label>
                Phone Number *
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={event =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={form.email}
                  onChange={event =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="Enter email address"
                />
              </label>

              <label>
                Address
                <textarea
                  rows="3"
                  value={form.address}
                  onChange={event =>
                    setForm({ ...form, address: event.target.value })
                  }
                  placeholder="Enter address"
                />
              </label>

              {error && (
                <div className="customers-error" role="alert">
                  {error}
                </div>
              )}

              <div className="customer-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
