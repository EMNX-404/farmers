import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';

export function LoadingSkeleton({ count = 4, height = 240, style = {} }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        ...style,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{ height: `${height}px`, display: 'flex', flexDirection: 'column' }}
        >
          <div className="skeleton" style={{ height: '60%', width: '100%' }} />
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
            <div className="skeleton" style={{ height: '18px', width: '75%' }} />
            <div className="skeleton" style={{ height: '14px', width: '50%' }} />
            <div className="skeleton" style={{ height: '24px', width: '35%', marginTop: 'auto' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'No items found',
  description = 'Try adjusting your filters or check back later.',
  actionText,
  onAction,
  icon,
}) {
  return (
    <div
      className="card animate-fade"
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '2rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-leaf-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--color-grass)',
        }}
      >
        {icon || <FolderSearch size={32} />}
      </div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load content from the server.',
  onRetry,
}) {
  return (
    <div
      className="card animate-fade"
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        borderColor: 'var(--color-error-soft)',
        backgroundColor: '#fffdfc',
        margin: '2rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-soft)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
        }}
      >
        <AlertCircle size={28} />
      </div>
      <h3 style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline"
          style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
        >
          <RefreshCw size={15} />
          Retry
        </button>
      )}
    </div>
  );
}
