import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle2, ShieldAlert, XCircle, Search, RefreshCw } from 'lucide-react';
import farmerService from '../../services/farmerService';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function AdminFarmersPage() {
  const { showToast } = useToast();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getFarmers();
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminService.approveFarmer(id);
      setFarmers(farmers.map((f) => (f._id === id ? { ...f, status: 'active' } : f)));
      showToast?.('Farmer stall approved and published!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to approve farmer', 'error');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this farmer account? Their stall will be hidden from patrons.')) return;
    try {
      await adminService.suspendFarmer(id);
      setFarmers(farmers.map((f) => (f._id === id ? { ...f, status: 'suspended' } : f)));
      showToast?.('Farmer account suspended', 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to suspend farmer', 'error');
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch = (f.businessName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Verification & Moderation
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Growers & Stall Approvals
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Authorize local producers, audit farm locations, and maintain network trust.
            </p>
          </div>

          <button onClick={fetchFarmers} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Search farm stall name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '280px', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
          />

          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active & Verified</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filteredFarmers.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Sprout size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: 'var(--color-forest)' }}>No growers found</h3>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Stall Name</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Contact</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Farm Address</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((frm) => (
                  <tr key={frm._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                      {frm.businessName || 'Family Farm'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {frm.contactNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {frm.farmAddress || 'Springfield Rural Route'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          backgroundColor:
                            frm.status === 'active'
                              ? 'var(--color-leaf-soft)'
                              : frm.status === 'pending'
                              ? '#fef3c7'
                              : 'var(--color-error-soft)',
                          color:
                            frm.status === 'active'
                              ? 'var(--color-forest)'
                              : frm.status === 'pending'
                              ? '#92400e'
                              : 'var(--color-error)',
                        }}
                      >
                        {frm.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {frm.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(frm._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Approve
                          </button>
                        )}
                        {frm.status !== 'suspended' && (
                          <button
                            type="button"
                            onClick={() => handleSuspend(frm._id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-error)' }}
                          >
                            Suspend
                          </button>
                        )}
                      </div>
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
