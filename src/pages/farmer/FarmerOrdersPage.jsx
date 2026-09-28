import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  Calendar,
  Phone,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { FadeIn, SlideUp } from '../../Animation';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export default function FarmerOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getFarmerOrders();
      const list = res.data || res || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      showToast?.(`Order updated to: ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Order Processing
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Pre-Orders Fulfillment Queue
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Progress pre-orders from placement to packaging and stall pickup.
            </p>
          </div>

          <button onClick={fetchOrders} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'placed', label: `New Placed (${orders.filter((o) => o.status === 'placed').length})` },
            { id: 'accepted', label: `Accepted / Packing (${orders.filter((o) => o.status === 'accepted').length})` },
            { id: 'ready', label: `Ready for Pickup (${orders.filter((o) => o.status === 'ready').length})` },
            { id: 'completed', label: `Completed (${orders.filter((o) => o.status === 'completed').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: statusFilter === tab.id ? '700' : '500',
                backgroundColor: statusFilter === tab.id ? 'var(--color-forest)' : 'transparent',
                color: statusFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Cards List */}
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <PackageCheck size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-forest)', margin: 0 }}>No orders in this status category</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Incoming reservations from patrons will show up here automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredOrders.map((ord) => {
              const customer = ord.customer || {};
              const market = ord.market || {};
              const isUpdating = updatingId === ord._id;

              return (
                <div
                  key={ord._id}
                  className="card"
                  style={{
                    padding: '2rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--color-forest)' }}>
                          #{ord.orderNumber || ord._id?.slice(-6).toUpperCase()}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            textTransform: 'uppercase',
                            backgroundColor:
                              ord.status === 'completed'
                                ? 'var(--color-leaf-soft)'
                                : ord.status === 'ready'
                                ? '#dbeafe'
                                : ord.status === 'cancelled'
                                ? 'var(--color-error-soft)'
                                : 'var(--color-moss-soft)',
                            color:
                              ord.status === 'completed'
                                ? 'var(--color-forest)'
                                : ord.status === 'ready'
                                ? '#1e40af'
                                : ord.status === 'cancelled'
                                ? 'var(--color-error)'
                                : 'var(--color-grass)',
                          }}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Patron: <strong>{customer.name || 'Local Customer'}</strong></span>
                        <span>📞 {customer.contactNumber || 'Contact at pickup'}</span>
                        <span>📍 {market.name || 'Central Market'}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>To collect at stall:</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                        ${Number(ord.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ margin: '1.5rem 0' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--color-forest)', marginBottom: '0.75rem' }}>
                      Reserved Items to Pack:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                      {(ord.items || []).map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-white)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.88rem',
                          }}
                        >
                          <span>
                            <strong>{it.quantity}x</strong> {it.product?.name || 'Produce Item'}
                          </span>
                          <span style={{ fontWeight: '700', color: 'var(--color-forest)' }}>
                            ${(Number(it.price || it.product?.price || 0) * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifecycle progression buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Pickup Window: <strong>{ord.pickupSlot?.timeSlot || 'Saturday Morning'}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {ord.status === 'placed' && (
                        <>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(ord._id, 'declined')}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-error)' }}
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(ord._id, 'accepted')}
                            className="btn btn-primary btn-sm"
                          >
                            Accept & Reserve Stock
                          </button>
                        </>
                      )}

                      {ord.status === 'accepted' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(ord._id, 'ready')}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#1d4ed8' }}
                        >
                          Mark Packed & Ready for Pickup
                        </button>
                      )}

                      {ord.status === 'ready' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(ord._id, 'completed')}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm Paid & Picked Up
                        </button>
                      )}

                      {ord.status === 'completed' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-grass)', fontWeight: '700' }}>
                          ✓ Order Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
