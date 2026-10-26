
import React, { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShoppingBag,
  RefreshCw,
  Package
} from 'lucide-react';

export default function NotificationsPage({ onNavigate }) {  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications() {
    setLoading(true);
    setError('');

    try {
      const [productResponse, orderResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/purchase-orders')
      ]);

      if (!productResponse.ok) {
        throw new Error('Could not load inventory alerts.');
      }

      if (!orderResponse.ok) {
        throw new Error('Could not load purchase order alerts.');
      }

      const productResult = await productResponse.json();
      const orderResult = await orderResponse.json();

      const products = Array.isArray(productResult)
        ? productResult
        : productResult.data || productResult.products || [];

      const orders = Array.isArray(orderResult)
        ? orderResult
        : orderResult.data || orderResult.purchaseOrders || orderResult.orders || [];

      const alerts = [];

      products.forEach(product => {
        const quantity = Number(product.quantity) || 0;

        if (quantity <= 5) {
          alerts.push({
            id: `stock-${product._id}`,
            type: quantity === 0 ? 'critical' : 'warning',
            icon: AlertTriangle,
            title: quantity === 0 ? 'Out of Stock' : 'Low Stock Alert',
            message: `${product.name || 'Product'} has ${quantity} unit(s) remaining.`,
            detail: 'Inventory',
            page: 'stock-alerts'
          });
        }
      });

      orders.forEach(order => {
        if (['Draft', 'Ordered'].includes(order.status)) {
          alerts.push({
            id: `order-${order._id}`,
            type: 'info',
            icon: ShoppingBag,
            title: 'Purchase Order Pending',
            message: `${order.orderNumber || 'Purchase order'} is currently ${order.status}.`,
            detail: 'Procurement',
            page: 'purchases'
          });
        }
      });

      setNotifications(alerts);
    } catch (err) {
      setError(err.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);
function openRelatedPage(page) {
  if (onNavigate) {
    onNavigate(page);
  }
}

  return (
    <div className="page-container">
      <div className="page-heading">
        <h2>Notification Center</h2>
        <p>Review low-stock products and pending purchase orders.</p>
      </div>

      <div className="notification-toolbar">
        <div className="notification-count-card">
          <Bell size={22} />
          <div>
            <strong>{notifications.length}</strong>
            <span>Current Alerts</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-refresh"
          onClick={loadNotifications}
          disabled={loading}
          title="Refresh notifications"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && <p>Loading notifications...</p>}

      {error && (
        <p role="alert" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="notification-empty">
          <Package size={32} />
          <h3>All caught up!</h3>
          <p>There are no low-stock or pending purchase-order alerts.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notification-list">
          {notifications.map(item => {
            const Icon = item.icon;

            return (
              <article
                key={item.id}
                className={`notification-card notification-${item.type}`}
              >
                <div className="notification-icon">
                  <Icon size={21} />
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{item.title}</h3>
                    <span>{item.detail}</span>
                  </div>

                  <p>{item.message}</p>

                  <button
                    type="button"
                    className="notification-link"
                    onClick={() => openRelatedPage(item.page)}
                  >
                    View related module →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
