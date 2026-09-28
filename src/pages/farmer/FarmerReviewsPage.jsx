import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CornerDownRight, CheckCircle2, User } from 'lucide-react';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export default function FarmerReviewsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = async (reviewId) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) return;

    setSubmittingId(reviewId);
    try {
      await reviewService.respondToReview(reviewId, text.trim());
      setReviews(
        reviews.map((r) =>
          r._id === reviewId ? { ...r, farmerResponse: { comment: text.trim(), respondedAt: new Date() } } : r
        )
      );
      setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
      showToast?.('Response posted to patron!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to submit response', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
            Customer Feedback
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Patron Reviews & Ratings
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Read feedback from market customers and reply directly to their notes.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : reviews.length === 0 ? (
          <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <Star size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-forest)', margin: 0 }}>No reviews received yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Reviews from verified patrons who completed their pickup pre-orders will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="card"
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest)' }}>
                      {rev.customer?.name || 'Verified Patron'}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Review for: <strong>{rev.product?.name || 'Farm Harvest'}</strong> • {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < rev.rating ? '#f59e0b' : 'none'}
                        color={i < rev.rating ? '#f59e0b' : '#d1d5db'}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  "{rev.comment}"
                </p>

                {/* Existing Farmer Response */}
                {rev.farmerResponse?.comment ? (
                  <div
                    style={{
                      backgroundColor: 'var(--color-leaf-soft)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--color-grass)',
                      marginTop: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Your Stall Response:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-forest)' }}>
                      {rev.farmerResponse.comment}
                    </p>
                  </div>
                ) : (
                  /* Reply box */
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Write a friendly reply to this patron..."
                      value={replyTextMap[rev._id] || ''}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev._id]: e.target.value })}
                      style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      disabled={submittingId === rev._id}
                      onClick={() => handleReply(rev._id)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <CornerDownRight size={14} />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
