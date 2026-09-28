import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, ShieldCheck, UserX } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers();
      const list = res.data || res || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await adminService.updateCustomerStatus(id, newStatus);
      setCustomers(customers.map((c) => (c._id === id ? { ...c, status: newStatus } : c)));
      showToast?.(`Customer status set to: ${newStatus}`, 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to update status', 'error');
    }
  };

  const filtered = customers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              User Directory
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Registered Patrons
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Directory of community market customers with account status controls.
            </p>
          </div>

          <button onClick={fetchCustomers} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem', maxWidth: '360px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
          />
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: 'var(--color-forest)' }}>No customers found</h3>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Patron Name</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Email</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Contact</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {c.email}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                      {c.contactNumber || 'None'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          backgroundColor: c.status === 'suspended' ? 'var(--color-error-soft)' : 'var(--color-leaf-soft)',
                          color: c.status === 'suspended' ? 'var(--color-error)' : 'var(--color-forest)',
                        }}
                      >
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c._id, c.status)}
                        className="btn btn-outline btn-sm"
                        style={{ color: c.status === 'suspended' ? 'var(--color-grass)' : 'var(--color-error)' }}
                      >
                        {c.status === 'suspended' ? 'Re-activate' : 'Suspend'}
                      </button>
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
