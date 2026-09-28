import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Calendar, Store, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';
import marketService from '../../services/marketService';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function AdminAnnouncementsPage() {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetMarket, setTargetMarket] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const [annRes, mktRes] = await Promise.all([
        adminService.getAnnouncements(),
        marketService.getMarkets(),
      ]);
      setAnnouncements(Array.isArray(annRes) ? annRes : []);
      setMarkets(Array.isArray(mktRes) ? mktRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        priority,
        market: targetMarket === 'all' ? null : targetMarket,
      };

      const created = await adminService.createAnnouncement(payload);
      setAnnouncements([created, ...announcements]);
      setTitle('');
      setMessage('');
      showToast?.('Announcement published to patrons and farmers!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Remove this announcement?')) return;
    try {
      await adminService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a._id !== id));
      showToast?.('Announcement removed', 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete announcement', 'error');
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
            Public Broadcasts
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Market Announcements
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Broadcast weather advisories, seasonal opening schedules, and holiday market hours.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Post Announcement Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '1.25rem' }}>
              Broadcast New Advisory
            </h3>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Strawberry Harvest Weekend at Central Market!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Target Market
                  </label>
                  <select
                    className="input"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="all">All Community Markets</option>
                    {markets.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    className="input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="normal">Normal News</option>
                    <option value="high">High (Featured Alert)</option>
                    <option value="urgent">Urgent (Weather / Closure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Announcement Message
                </label>
                <textarea
                  rows={4}
                  required
                  className="input"
                  placeholder="Details on vendor specials, parking instructions, live music..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: 'fit-content', padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
              >
                <Megaphone size={16} />
                {submitting ? 'Broadcasting...' : 'Publish Announcement'}
              </button>
            </form>
          </div>

          {/* List of Active Announcements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : announcements.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                <Megaphone size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: 'var(--color-forest)' }}>No announcements posted</h4>
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: ann.priority === 'urgent' ? '4px solid var(--color-error)' : '4px solid var(--color-grass)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-forest)' }}>
                          {ann.title}
                        </strong>
                        {ann.priority === 'urgent' && (
                          <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>Urgent</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="btn-icon"
                      title="Delete"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {ann.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
