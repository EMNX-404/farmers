import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          let bg = '#ffffff';
          let border = '#e8e6df';
          let icon = <CheckCircle2 size={18} color="var(--color-grass)" />;

          if (toast.type === 'error') {
            border = '#f5c6cb';
            icon = <AlertCircle size={18} color="var(--color-error)" />;
          } else if (toast.type === 'warning') {
            border = '#ffeeba';
            icon = <AlertTriangle size={18} color="var(--color-warning)" />;
          } else if (toast.type === 'info') {
            border = '#bee5eb';
            icon = <Info size={18} color="var(--color-info)" />;
          }

          return (
            <div
              key={toast.id}
              className="card animate-fade"
              style={{
                pointerEvents: 'auto',
                background: bg,
                border: `1px solid ${border}`,
                boxShadow: 'var(--shadow-lg)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon}
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {toast.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
