import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { FadeIn, SlideUp } from '../../Animation';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';
import { getProductImage } from '../../utils/assets';

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Could not load order details');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this pre-order? Reserved stock will be returned to the farmer.')) {
      return;
    }
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(id, 'Customer cancellation request');
      setOrder(updated);
      showToast?.('Pre-order has been cancelled', 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order?.items) return;
    try {
      for (const item of order.items) {
        if (item.product?._id || item.product) {
          await addToCart(item.product._id || item.product, item.quantity);
        }
      }
      showToast?.('Items re-added to your pre-order cart!', 'success');
      navigate('/customer/cart');
    } catch (err) {
      showToast?.(err.message || 'Failed to reorder items', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <ErrorState
          title="Order not found"
          message={error || 'We could not locate this pre-order record.'}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/customer/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const market = order.market || {};
  const farmer = order.farmer || {};
  const isCancellable = ['placed', 'accepted'].includes(order.status);

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Top return link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/customer/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>

        {/* Invoice / Pickup Card Header */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-moss">Pre-Order Pass</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
                Order #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Show this digital reservation voucher to the farmer at pickup.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Due at Stall:</div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--color-grass)', lineHeight: 1.1 }}>
                ${Number(order.totalAmount || 0).toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                💵 Payment in person (Cash or Card)
              </span>
            </div>
          </div>

          {/* Fulfillment Status Timeline */}
          <div style={{ margin: '2rem 0' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest)', marginBottom: '1rem' }}>
              Fulfillment Status
            </h3>
            <OrderTimeline status={order.status} dates={order} />
          </div>

          {/* Pickup Details Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              backgroundColor: 'var(--color-white)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              margin: '2rem 0',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <Store size={16} /> Market Location
              </div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-forest)' }}>
                {market.name || 'Downtown Farmers Market'}
              </strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                📍 {market.address || 'Market Square Plaza'}, {market.city || 'Springfield'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <Calendar size={16} /> Pickup Window
              </div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-forest)' }}>
                {order.pickupSlot?.timeSlot || 'Saturday Morning'}
              </strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : 'Active Market Cycle'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={16} /> Grower / Stall
              </div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-forest)' }}>
                {farmer.businessName || 'Family Farm Stall'}
              </strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                📞 {farmer.contactNumber || 'Available at market stall'}
              </div>
            </div>
          </div>

          {/* Reserved Items Table */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '1rem' }}>
              Reserved Produce Items
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(order.items || []).map((it, idx) => {
                const prod = it.product || {};
                const img = getProductImage(prod);
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={img}
                        alt={prod.name}
                        style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--color-forest)' }}>
                          {prod.name || 'Harvest Item'}
                        </strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          ${Number(it.price || prod.price || 0).toFixed(2)} per unit
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Quantity: <strong>{it.quantity}</strong>
                      </span>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.2rem' }}>
                        ${(Number(it.price || prod.price || 0) * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <div>
              {isCancellable && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="btn btn-outline"
                  style={{ color: 'var(--color-error)', borderColor: '#f5c6cb' }}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Pre-Order'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleReorder}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ShoppingBag size={16} /> Re-Order These Items
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
