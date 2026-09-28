import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 540 }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(27, 46, 22, 0.65)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.25s ease',
        }}
      />

      {/* Modal Card */}
      <div
        className="card animate-slide-up"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: `${maxWidth}px`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1001,
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ width: '2rem', height: '2rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '2.5rem 0' }}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn btn-outline btn-sm"
        style={{ padding: '0.4rem 0.65rem' }}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}
          style={{ width: '2.25rem', padding: '0.4rem 0', justifyContent: 'center' }}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn btn-outline btn-sm"
        style={{ padding: '0.4rem 0.65rem' }}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
