import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let typeClass = 'toast-success';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          typeClass = 'toast-error';
        } else if (toast.type === 'info') {
          Icon = Info;
          typeClass = 'toast-info';
        }

        return (
          <div key={toast.id} className={`toast ${typeClass}`}>
            <Icon size={18} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ color: '#94a3b8', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
