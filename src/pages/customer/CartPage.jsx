import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getProductImage } from '../../utils/assets';
import { FadeIn, SlideUp } from '../../Animation';

export default function CartPage() {
  const { cart, totalAmount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleUpdate = async (productId, newQty) => {
    if (newQty < 1) {
      await removeItem(productId);
      showToast?.('Item removed from pre-order', 'info');
    } else {
      await updateQuantity(productId, newQty);
    }
  };

  const handleRemove = async (productId) => {
    await removeItem(productId);
    showToast?.('Item removed', 'info');
  };

  const handleClear = async () => {
    if (window.confirm('Clear all items from your pre-order cart?')) {
      await clearCart();
      showToast?.('Cart cleared', 'info');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-narrow" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <FadeIn>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-leaf-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-grass)',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShoppingBag size={40} />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
            Your Pre-Order Cart is Empty
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Reserve farm-fresh berries, heirloom tomatoes, honey, and fresh bakery goods for pickup at your local market stall.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Browse Fresh Produce <ArrowRight size={16} />
          </Link>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Pre-Order Pickup
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Your Reservation Cart
            </h1>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{ fontSize: '0.85rem', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Trash2 size={15} /> Clear All
          </button>
        </div>

        {/* Notice Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-leaf-soft)',
            border: '1px solid rgba(236,243,158,0.8)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={22} color="var(--color-grass)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--color-forest)' }}>
            <strong>No upfront payment required!</strong> You pre-order to reserve inventory ahead of the market rush. You inspect your goods and pay the farmer directly in person at stall pickup (Cash or Card).
          </div>
        </div>

        {/* Layout Grid: Items Table vs Summary Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Items List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item, idx) => {
                const prod = item.product || {};
                const img = getProductImage(prod);
                const farmer = prod.farmer || {};

                return (
                  <div
                    key={item.product?._id || idx}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      paddingBottom: idx < items.length - 1 ? '1.5rem' : '0',
                      borderBottom: idx < items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={img}
                        alt={prod.name}
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-forest)' }}>
                          {prod.name || 'Produce Item'}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Grown by {farmer.businessName || 'Local Family Farm'}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-grass)', marginTop: '0.2rem' }}>
                          ${Number(item.price || prod.price || 0).toFixed(2)} / {prod.unit || 'unit'}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls & item total */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#fff',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleUpdate(prod._id || prod.id, item.quantity - 1)}
                          style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ padding: '0 0.6rem', fontSize: '0.9rem', fontWeight: '700', minWidth: '28px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdate(prod._id || prod.id, item.quantity + 1)}
                          style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '70px' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-forest)' }}>
                          ${(Number(item.price || prod.price || 0) * item.quantity).toFixed(2)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(prod._id || prod.id)}
                        className="btn-icon"
                        title="Remove item"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reservation Summary */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-forest)', marginBottom: '1.25rem' }}>
              Pre-Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reserved Items:</span>
                <strong>{items.reduce((sum, it) => sum + it.quantity, 0)} units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fulfillment Method:</span>
                <strong style={{ color: 'var(--color-grass)' }}>In-Person Stall Pickup</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Online Platform Fee:</span>
                <strong style={{ color: 'var(--color-forest)' }}>$0.00 (Free)</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                  Total to Pay at Stall:
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                  ${Number(totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/customer/checkout')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.75rem',
              }}
            >
              Choose Pickup Slot & Reserve <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/products" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ← Add more harvest items
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
