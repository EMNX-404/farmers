import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Check, AlertCircle, XCircle } from 'lucide-react';

export default function OrderTimeline({ status, dates = {} }) {
  const isCancelled = status === 'cancelled';
  const isDeclined = status === 'declined';

  if (isCancelled || isDeclined) {
    return (
      <div
        className="card animate-fade"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-error-soft)',
          borderColor: '#f5c6cb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <XCircle size={28} color="var(--color-error)" />
        <div>
          <h4 style={{ margin: 0, color: 'var(--color-error)' }}>
            Order {isCancelled ? 'Cancelled' : 'Declined'}
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isCancelled
              ? 'This pre-order was cancelled by the customer before fulfillment.'
              : 'The farmer was unable to accept this order and reserved quantities were returned to stock.'}
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'placed', label: 'Order Placed', time: dates.placedAt, icon: <Clock size={16} /> },
    { key: 'accepted', label: 'Stall Accepted', time: dates.acceptedAt, icon: <CheckCircle2 size={16} /> },
    { key: 'ready', label: 'Packed & Ready', time: dates.readyAt, icon: <PackageCheck size={16} /> },
    { key: 'completed', label: 'Picked Up & Paid', time: dates.completedAt, icon: <Check size={16} /> },
  ];

  const statusOrder = ['placed', 'accepted', 'ready', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div style={{ width: '100%', margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
                position: 'relative',
              }}
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    backgroundColor: idx < currentIndex ? 'var(--color-grass)' : '#e8e6df',
                    zIndex: 1,
                    transition: 'all 0.5s ease',
                  }}
                />
              )}

              {/* Circle Icon */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isPassed ? 'var(--color-grass)' : '#faf9f6',
                  color: isPassed ? '#faf9f6' : 'var(--text-muted)',
                  border: isCurrent
                    ? '3px solid var(--color-leaf)'
                    : isPassed
                    ? '3px solid var(--color-grass)'
                    : '2px solid #e8e6df',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(64,105,28,0.2)' : 'none',
                  transition: 'all 0.4s ease',
                }}
              >
                {step.icon}
              </div>

              {/* Label */}
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '0.85rem',
                  fontWeight: isPassed ? '700' : '500',
                  color: isPassed ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {step.label}
              </p>

              {/* Timestamp if available */}
              {step.time && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
