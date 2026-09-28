import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Store,
  Calendar,
  CheckCircle2,
  XCircle,
  PackageCheck,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import orderService from '../../services/orderService';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { FadeIn, SlideUp } from '../../Animation';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getCustomerOrders();
      const list = res.data || res || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    if (filter === 'active') return ['placed', 'accepted', 'ready'].includes(ord.status);
    if (filter === 'completed') return ord.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'declined'].includes(ord.status);
    return true;
  });

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Order Lifecycle
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Your Pre-Orders
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Track order acceptance, harvest packaging, and market pickup windows.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={fetchOrders} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/products" className="btn btn-primary btn-sm">
              New Pre-Order
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
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
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'active', label: `Active Pickups (${orders.filter((o) => ['placed', 'accepted', 'ready'].includes(o.status)).length})` },
            { id: 'completed', label: `Completed (${orders.filter((o) => o.status === 'completed').length})` },
            { id: 'cancelled', label: `Cancelled / Declined (${orders.filter((o) => ['cancelled', 'declined'].includes(o.status)).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: filter === tab.id ? '700' : '500',
                backgroundColor: filter === tab.id ? 'var(--color-forest)' : 'transparent',
                color: filter === tab.id ? '#fff' : 'var(--text-secondary)',
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

        {/* Orders List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <EmptyState
              title="No pre-orders found in this view"
              message="When you reserve produce online, your live status tracking and pickup verification will appear here."
            />
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Discover Fresh Produce
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredOrders.map((ord) => {
              const market = ord.market || {};
              const farmer = ord.farmer || {};

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                          #{ord.orderNumber || ord._id?.slice(-6).toUpperCase()}
                        </span>
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Store size={15} color="var(--color-grass)" />
                          <span>{market.name || 'Local Farmers Market'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={15} color="var(--color-grass)" />
                          <span>Pickup: {ord.pickupSlot?.timeSlot || (ord.pickupDate ? new Date(ord.pickupDate).toLocaleDateString() : 'Market Day')}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due at stall pickup:</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                        ${Number(ord.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Visual Status Progression */}
                  <OrderTimeline status={ord.status} dates={ord} />

                  {/* Items mini-strip & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <strong>{ord.items?.length || 0} produce item(s) reserved</strong>
                      {ord.items?.slice(0, 2).map((it, idx) => (
                        <span key={idx} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          • {it.quantity}x {it.product?.name || 'Item'}
                        </span>
                      ))}
                    </div>

                    <Link to={`/customer/orders/${ord._id}`} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      View Full Details & Receipt <ArrowRight size={14} />
                    </Link>
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
