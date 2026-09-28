import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Star,
  Store,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Share2,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import productService from '../../services/productService';
import favoriteService from '../../services/favoriteService';
import reviewService from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ASSETS, getProductImage, getFarmerImage } from '../../utils/assets';
import { FadeIn, SlideUp, ScaleOnHover } from '../../Animation';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);

        // Fetch reviews for this product
        try {
          const revs = await reviewService.getReviews({ product: id });
          setReviews(revs || []);
        } catch {
          setReviews([]);
        }

        // Fetch related products in same category
        if (data?.category) {
          const catId = typeof data.category === 'object' ? data.category._id : data.category;
          try {
            const related = await productService.getProducts({ category: catId, limit: 4 });
            setRelatedProducts((related || []).filter((p) => p._id !== id));
          } catch {
            setRelatedProducts([]);
          }
        }
      } catch (err) {
        setError(err.message || 'Product could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity <= 0) return;
    setAddingToCart(true);
    try {
      await addToCart(product._id || product.id, quantity);
      showToast?.(`Added ${quantity} ${product.unit || 'item'}(s) of ${product.name} to pre-order cart!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await favoriteService.toggleProduct(product._id || product.id);
      setIsFavorited(!isFavorited);
      showToast?.(isFavorited ? 'Removed from favorites' : 'Saved to favorites!', 'info');
    } catch (err) {
      showToast?.(err.message || 'Could not update favorites', 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview = await reviewService.createReview({
        productId: product._id || product.id,
        farmerId: product.farmer?._id || product.farmer,
        rating,
        comment: reviewComment.trim(),
      });
      setReviews([newReview, ...reviews]);
      setReviewComment('');
      showToast?.('Thank you for your review!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <LoadingSkeleton type="product" count={1} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <ErrorState
          title="Product not found"
          message={error || "The produce you're looking for is either unavailable or has been removed."}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/products" className="btn btn-primary">
            Back to Produce Catalog
          </Link>
        </div>
      </div>
    );
  }

  const farmer = product.farmer || {};
  const categoryName = typeof product.category === 'object' ? product.category?.name : 'Fresh Produce';
  const isOutOfStock = product.stockQuantity <= 0 || product.availabilityStatus === 'out_of_stock';
  const prodImg = getProductImage(product);
  const farmerImg = getFarmerImage(farmer);

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Breadcrumb Bar */}
      <div style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#fff', padding: '0.85rem 0' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--color-forest)', fontWeight: '600' }}>{product.name}</span>
        </div>
      </div>

      <div className="container-wide" style={{ marginTop: '2.5rem' }}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
            {/* Left: Product Image & Gallery */}
            <div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <img
                  src={prodImg}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '420px',
                    objectFit: 'cover',
                  }}
                />
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="btn-icon"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart
                    size={20}
                    color={isFavorited ? 'var(--color-error)' : 'var(--text-muted)'}
                    fill={isFavorited ? 'var(--color-error)' : 'none'}
                  />
                </button>

                {isOutOfStock && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(200,65,52,0.92)',
                      color: '#fff',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                    }}
                  >
                    Sold Out for This Market
                  </div>
                )}
              </div>

              {/* Freshness & Trust Markers */}
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', backgroundColor: 'var(--color-leaf-soft)', borderRadius: 'var(--radius-md)' }}>
                  <ShieldCheck size={22} color="var(--color-grass)" />
                  <div style={{ fontSize: '0.82rem', lineHeight: '1.3' }}>
                    <strong style={{ color: 'var(--color-forest)' }}>Direct From Grower</strong>
                    <div style={{ color: 'var(--text-secondary)' }}>100% verified stall origin</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', backgroundColor: 'var(--color-moss-soft)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={22} color="var(--color-forest)" />
                  <div style={{ fontSize: '0.82rem', lineHeight: '1.3' }}>
                    <strong style={{ color: 'var(--color-forest)' }}>Weekly Harvest</strong>
                    <div style={{ color: 'var(--text-secondary)' }}>Picked within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Purchase & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <span className="badge badge-moss" style={{ marginBottom: '0.75rem' }}>
                  {categoryName}
                </span>
                <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: '0.25rem 0 0.5rem', lineHeight: 1.15 }}>
                  {product.name}
                </h1>

                {/* Rating & Stock metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontWeight: '600' }}>
                    <Star size={17} fill="#f59e0b" />
                    <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({reviews.length} reviews)</span>
                  </div>
                  <span>·</span>
                  <span style={{ color: isOutOfStock ? 'var(--color-error)' : 'var(--color-grass)', fontWeight: '600' }}>
                    {isOutOfStock ? 'Currently Out of Stock' : `${product.stockQuantity || 20} ${product.unit || 'units'} available`}
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div style={{ padding: '1.25rem', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                    ${Number(product.price || 0).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                    / {product.unit || 'each'}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  💵 <strong>Pre-order online, pay in person at market pickup.</strong> No online checkout card required.
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>Harvest Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {product.description ||
                    'Freshly harvested directly from the fields. Grown without synthetic pesticides, allowing natural sweetness and peak ripeness to develop on the vine.'}
                </p>
              </div>

              {/* Farmer Stall Reference Card */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={farmerImg}
                    alt={farmer.businessName || 'Farmer'}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-grass)', fontWeight: '700' }}>
                      Grown by
                    </div>
                    <Link
                      to={`/farmers/${farmer._id || farmer.id || ''}`}
                      style={{ fontWeight: '700', color: 'var(--color-forest)', fontSize: '1rem' }}
                    >
                      {farmer.businessName || 'Local Family Farm'}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {farmer.operatingDays?.join(', ') || 'Saturday & Sunday Markets'}
                    </div>
                  </div>
                </div>
                <Link to={`/farmers/${farmer._id || farmer.id || ''}`} className="btn btn-outline btn-sm">
                  View Stall
                </Link>
              </div>

              {/* Quantity Selector & Add to Cart Action */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fff',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}
                      title="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0 1rem', fontWeight: '700', fontSize: '1rem', minWidth: '40px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stockQuantity || 50, quantity + 1))}
                      style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}
                      title="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                    }}
                  >
                    <ShoppingBag size={18} />
                    {addingToCart ? 'Reserving...' : `Pre-Order for Pickup • $${(product.price * quantity).toFixed(2)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Customer Reviews Section */}
        <div style={{ marginTop: '5rem', borderTop: '1px solid var(--color-border)', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-forest)', margin: 0 }}>
                Customer Feedback & Reviews
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Verified market patrons who pre-ordered this produce.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={24} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                {product.rating ? product.rating.toFixed(1) : '4.9'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>out of 5</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    No reviews yet for this harvest. Be the first to try and review after market pickup!
                  </p>
                </div>
              ) : (
                reviews.map((rev, idx) => (
                  <div key={idx} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                        {rev.customer?.name || rev.customerName || 'Verified Patron'}
                      </strong>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? '#f59e0b' : 'none'}
                            color={i < rev.rating ? '#f59e0b' : '#d1d5db'}
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                      {rev.comment}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Box */}
            <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                Leave a Market Review
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Share your thoughts on the quality, freshness, and pickup experience.
              </p>

              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Rating
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ padding: '4px', cursor: 'pointer' }}
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? '#f59e0b' : 'none'}
                          color={star <= rating ? '#f59e0b' : '#9ca3af'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Your Review
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    required
                    placeholder="Crisp, fresh, and perfectly ripe..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
