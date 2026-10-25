import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  User,
  CreditCard,
  AlertTriangle,
  Receipt,
  Package
} from 'lucide-react';
import InvoicePrintModal from './InvoicePrintModal';

const API_BASE = '/api';

const SalesPage = ({ addToast, onInventoryUpdated }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart state
  const [cart, setCart] = useState([]);

  // Customer & Payment state
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(5); // Default demo tax 5%
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Completed invoice modal
  const [completedInvoice, setCompletedInvoice] = useState(null);

  // Fetch available products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load products for POS:', err);
      addToast('Cannot connect to server to fetch catalog items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add item to cart
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      addToast(`"${product.name}" is currently out of stock.`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          addToast(`Maximum available stock reached for "${product.name}" (${product.quantity} units).`, 'error');
          return prev;
        }
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            availableStock: product.quantity,
            quantity: 1
          }
        ];
      }
    });
  };

  // Update item quantity in cart
  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (newQty > item.availableStock) {
            addToast(`Only ${item.availableStock} units available for "${item.name}".`, 'error');
            return { ...item, quantity: item.availableStock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  // Handle Checkout submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast('Your cart is empty. Add products before checkout.', 'error');
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        customer: {
          name: customer.name.trim() || 'Walk-in Customer',
          phone: customer.phone.trim(),
          email: customer.email.trim(),
          address: customer.address.trim()
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod,
        taxRate,
        notes: notes.trim()
      };

      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(`Sale finalized! Invoice ${data.data?.invoiceNumber} generated.`, 'success');
        setCompletedInvoice(data.data);
        clearCart();
        setCustomer({ name: '', phone: '', email: '', address: '' });
        setNotes('');
        fetchProducts(); // Refresh available stock counts
        if (onInventoryUpdated) onInventoryUpdated();
      } else {
        addToast(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      addToast('Network error during checkout process', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchName && matchCategory;
  });

  const uniqueCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  return (
    <div className="pos-layout-container">
      {/* LEFT COLUMN: Product Catalog Selection Grid */}
      <div className="pos-catalog-panel">
        <div className="controls-card" style={{ padding: '0.85rem 1rem' }}>
          <div className="controls-row">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products to add to cart..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="pos-products-grid">
          {loading ? (
            <div style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>
              Loading inventory catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
              <Package size={32} color="#94a3b8" />
              <h4 style={{ marginTop: '0.5rem' }}>No products found</h4>
              <p>No products match your search or filter condition.</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const inStock = p.quantity > 0;
              const isLowStock = inStock && p.quantity <= 5;
              const cartItem = cart.find((i) => i.productId === p._id);
              const inCartQty = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={p._id}
                  className={`pos-product-card ${!inStock ? 'card-out-of-stock' : ''}`}
                  onClick={() => inStock && addToCart(p)}
                >
                  <div className="pos-card-header">
                    <span className="category-badge">{p.category}</span>
                    {p.quantity === 0 ? (
                      <span className="stock-badge out-of-stock">Depleted</span>
                    ) : isLowStock ? (
                      <span className="stock-badge low-stock">{p.quantity} left</span>
                    ) : (
                      <span className="stock-badge in-stock">{p.quantity} in stock</span>
                    )}
                  </div>

                  <div className="pos-card-title">{p.name}</div>

                  <div className="pos-card-footer">
                    <div className="pos-card-price">{formatCurrency(p.price)}</div>
                    {inStock && (
                      <button
                        type="button"
                        className="btn-primary pos-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                      >
                        <Plus size={14} />
                        {inCartQty > 0 ? <span>In Cart ({inCartQty})</span> : <span>Add</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart, Customer & Checkout */}
      <div className="pos-cart-panel">
        <div className="pos-cart-card">
          <div className="pos-cart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} color="#4f46e5" />
              <h3>Current Sale Cart</h3>
              <span className="count-chip">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} units
              </span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={clearCart}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="pos-cart-items-list">
            {cart.length === 0 ? (
              <div className="pos-empty-cart">
                <ShoppingCart size={40} color="#cbd5e1" />
                <p>Your sales cart is empty.</p>
                <span>Click items on the left to add them to this sale.</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="pos-cart-item-row">
                  <div className="pos-item-info">
                    <span className="pos-item-name">{item.name}</span>
                    <span className="pos-item-unit-price">
                      {formatCurrency(item.price)} each • Max: {item.availableStock}
                    </span>
                  </div>

                  <div className="pos-qty-controls">
                    <button
                      type="button"
                      className="pos-qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="pos-qty-val">{item.quantity}</span>
                    <button
                      type="button"
                      className="pos-qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="pos-item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  <button
                    type="button"
                    className="pos-item-remove-btn"
                    onClick={() => removeFromCart(item.productId)}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Customer & Payment Form */}
          <div className="pos-checkout-section">
            <div className="pos-customer-grid">
              <input
                type="text"
                className="form-input"
                placeholder="Customer Name (optional)"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Phone (optional)"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">Payment: UPI</option>
                <option value="Cash">Payment: Cash</option>
                <option value="Card">Payment: Card</option>
                <option value="Bank Transfer">Payment: Bank Transfer</option>
              </select>

              <select
                className="form-select"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              >
                <option value={0}>Tax: 0% (None)</option>
                <option value={5}>Tax: 5% (Demo Rate)</option>
                <option value={12}>Tax: 12% (Demo Rate)</option>
                <option value={18}>Tax: 18% (Demo Rate)</option>
              </select>
            </div>

            {/* Calculations Summary */}
            <div className="pos-bill-summary">
              <div className="bill-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="bill-row">
                <span>Demo Tax ({taxRate}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="bill-row grand-bill-row">
                <span>Total Amount:</span>
                <span className="grand-bill-amount">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              className="btn-primary pos-checkout-btn"
              disabled={cart.length === 0 || isCheckingOut}
              onClick={handleCheckout}
            >
              <Check size={18} />
              <span>
                {isCheckingOut
                  ? 'Processing Checkout & Decrementing Stock...'
                  : `Complete Sale (${formatCurrency(grandTotal)})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal upon Sale Completion */}
      <InvoicePrintModal
        isOpen={Boolean(completedInvoice)}
        invoice={completedInvoice}
        onClose={() => setCompletedInvoice(null)}
      />
    </div>
  );
};

export default SalesPage;
