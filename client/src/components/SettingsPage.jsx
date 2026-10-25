
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [form, setForm] = useState({
    businessName: 'StockLite ERP',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error('Could not load settings.');
        return res.json();
      })
      .then(data => {
        setForm({
          businessName: data.businessName || 'StockLite ERP',
          phone: data.phone || '',
          address: data.address || ''
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Could not save settings.');

      setForm({
        businessName: data.settings.businessName,
        phone: data.settings.phone || '',
        address: data.settings.address || ''
      });
      setMessage('Settings saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container">Loading settings...</div>;

  return (
    <div className="page-container">
      <div className="page-heading">
        <h2>Settings</h2>
        <p>Manage your basic business information.</p>
      </div>

      <form
  onSubmit={handleSubmit}
  style={{
    maxWidth: 700,
    marginTop: 24,
    padding: 32,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)'
  }}
>
        <label htmlFor="businessName">Business Name</label>
        <input
          id="businessName"
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: 12, margin: '8px 0 20px', boxSizing: 'border-box' }}
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          style={{ width: '100%', padding: 12, margin: '8px 0 20px', boxSizing: 'border-box' }}
        />

        <label htmlFor="address">Business Address</label>
        <textarea
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%', padding: 12, margin: '8px 0 20px', boxSizing: 'border-box' }}
        />

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p role="alert" style={{ color: '#c62828' }}>{error}</p>}
<button
  type="submit"
  disabled={saving}
  style={{
    padding: '12px 24px',
    background: saving ? '#818cf8' : '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: saving ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
  }}
>
  {saving ? 'Saving...' : 'Save Settings'}
</button>
      </form>
    </div>
  );
}
