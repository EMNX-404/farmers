import React, { useState, useEffect } from 'react';
import { Package, Search, RefreshCw, Store, Calendar, ArrowRight } from 'lucide-react';
import orderService from '../../services/orderService';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders();
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

  const filtered = orders.filter((o) => {
    const matchesSearch = (o.orderNumber || o._id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Platform Transactions
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              All Pre-Orders
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Platform-wide visibility across all market stalls and participating growers.
            </p>
          </div>

          <button onClick={fetchOrders} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '260px', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
          />

          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="ready">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: 'var(--color-forest)' }}>No pre-orders match</h3>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Order #</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Market</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Patron</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Amount</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                      #{ord.orderNumber || ord._id?.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {ord.market?.name || 'Local Market'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {ord.customer?.name || 'Customer'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--color-grass)' }}>
                      ${Number(ord.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          backgroundColor:
                            ord.status === 'completed'
                              ? 'var(--color-leaf-soft)'
                              : ord.status === 'ready'
                              ? '#dbeafe'
                              : 'var(--color-moss-soft)',
                          color:
                            ord.status === 'completed'
                              ? 'var(--color-forest)'
                              : ord.status === 'ready'
                              ? '#1e40af'
                              : 'var(--color-grass)',
                        }}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
