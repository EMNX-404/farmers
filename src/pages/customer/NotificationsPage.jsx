import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, Megaphone, AlertCircle } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      const list = res.data || res || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Alerts & Updates
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest)', margin: 0 }}>
              Notifications
            </h1>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : notifications.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-forest)', margin: 0 }}>No notifications yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
              You will receive alerts when your order is accepted, packed, or ready at the stall.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  backgroundColor: notif.isRead ? '#fff' : 'var(--color-leaf-soft)',
                  border: notif.isRead ? '1px solid var(--color-border)' : '1px solid rgba(64,105,28,0.25)',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: notif.type === 'order' ? 'var(--color-grass)' : 'var(--color-forest)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {notif.type === 'order' ? <CheckCircle2 size={18} /> : <Megaphone size={18} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-forest)' }}>
                      {notif.title || 'Market Update'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
