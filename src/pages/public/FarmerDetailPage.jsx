import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Phone,
  Store,
  Star,
  Heart,
  ChevronLeft,
  Navigation,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import farmerService from '../../services/farmerService';
import favoriteService from '../../services/favoriteService';
import { getFarmerImage, ASSETS } from '../../utils/assets';
import { MapView, DirectionsButton } from '../../components/maps/MapView';
import ProductCard from '../../components/products/ProductCard';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  FlipCard,
} from '../../Animation';

export default function FarmerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadFarmer() {
      try {
        setLoading(true);
        setError(null);
        const data = await farmerService.getFarmerById(id);
        setFarmer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFarmer();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast('Please sign in to save favorite farmers', 'info');
      return;
    }
    try {
      setIsFavorite(!isFavorite);
      await favoriteService.toggleFarmer(id);
      showToast(isFavorite ? 'Removed from favorites' : 'Farmer saved to favorites', 'success');
    } catch (err) {
      setIsFavorite(isFavorite);
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <LoadingSkeleton count={2} height={360} />
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <ErrorState title="Farmer not found" message={error || 'Could not locate farmer profile.'} />
      </div>
    );
  }

  const coordinates = {
    lat: farmer.location?.coordinates?.[1] || 44.04,
    lng: farmer.location?.coordinates?.[0] || -123.01,
  };

  const farmerMarker = [
    {
      id: farmer._id,
      type: 'farmer',
      name: farmer.businessName,
      businessName: farmer.businessName,
      address: farmer.address,
      coordinates,
    },
  ];

  const products = farmer.products || [];
  const reviews = farmer.recentReviews || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          position: 'relative',
          height: '380px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-forest)',
        }}
      >
        <img
          src={getFarmerImage(farmer)}
          alt={farmer.businessName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(27,46,22,0.95) 0%, rgba(27,46,22,0.3) 100%)',
          }}
        />

        <div
          className="container-wide"
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: 0,
            right: 0,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1.5rem',
            color: '#faf9f6',
          }}
        >
          <FadeIn delay={0.1}>
            <div style={{ maxWidth: '640px' }}>
              <Link
                to="/farmers"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--color-leaf)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  textDecoration: 'none',
                }}
              >
                <ChevronLeft size={16} /> All Farmers
              </Link>
              <h1 style={{ color: '#faf9f6', fontSize: 'clamp(2rem, 4vw, 2.75rem)', margin: 0, lineHeight: 1.15 }}>
                {farmer.businessName}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'rgba(250,249,246,0.9)' }}>
                {farmer.address && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={16} color="var(--color-leaf)" />
                    {farmer.address}
                  </span>
                )}
                {farmer.contactNumber && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={16} color="var(--color-leaf)" />
                    {farmer.contactNumber}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffb703', fontWeight: '700' }}>
                  <Star size={16} fill="#ffb703" color="#ffb703" />
                  <CountUp target={farmer.ratingAverage || 4.9} suffix=" rating" />
                  ({farmer.ratingCount || 12} reviews)
                </span>
              </div>
            </div>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`btn ${isFavorite ? 'btn-secondary' : 'btn-outline-white'}`}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'transparent'} />
                <span>{isFavorite ? 'Saved' : 'Favorite Farm'}</span>
              </button>
              <DirectionsButton coordinates={coordinates} address={farmer.address} />
            </div>
          </SlideUp>
        </div>
      </div>

      {/* 2. Details & Interactive FlipCard */}
      <div className="container-wide">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SlideUp delay={0.1}>
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-forest)' }}>Farm Story & Philosophy</h3>
                <p style={{ lineHeight: '1.7', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {farmer.description ||
                    'Growing wholesome, nourishing produce right here in the valley. We care deeply about soil health, biodiversity, and fresh taste.'}
                </p>

                <div
                  style={{
                    marginTop: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1.5rem',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-grass)', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                      Market Days
                    </h4>
                    <p style={{ margin: 0, fontWeight: '600' }}>
                      {Array.isArray(farmer.marketDays) ? farmer.marketDays.join(', ') : 'Saturdays'}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-grass)', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                      Pickup Windows
                    </h4>
                    <p style={{ margin: 0, fontWeight: '600' }}>
                      {Array.isArray(farmer.pickupWindows) ? farmer.pickupWindows.join(' | ') : '09:00 - 12:00'}
                    </p>
                  </div>
                </div>
              </div>
            </SlideUp>

            {/* 3D FlipCard: Growing Standards */}
            <SlideUp delay={0.15}>
              <FlipCard
                height={260}
                front={
                  <div style={{ height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-grass)', marginBottom: '0.75rem' }}>
                        <Sprout size={22} />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>Sustainable Soil Practices</span>
                      </div>
                      <h4 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                        Regenerative & Chemical-Free
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                        Our field is enriched with cover crops, compost teas, and natural pest balancing.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.85rem' }}>
                      <span>Flip to see harvest guarantee</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                }
                back={
                  <div style={{ height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--color-forest)', color: '#fff' }}>
                    <h4 style={{ fontSize: '1.2rem', color: 'var(--color-leaf)', marginBottom: '0.5rem' }}>
                      Harvested The Morning Of Market
                    </h4>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.9 }}>
                      When you pre-order with us, our pickers selectively gather your produce at dawn. That means vibrant chlorophyll, crisp stems, and nutrients intact.
                    </p>
                  </div>
                }
              />
            </SlideUp>

            {/* Markets Attended */}
            {farmer.markets?.length > 0 && (
              <SlideUp delay={0.2}>
                <div className="card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--color-forest)' }}>Find Our Stall At</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {farmer.markets.map((m) => (
                      <Link
                        key={m._id || m}
                        to={`/markets/${m._id || m}`}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-leaf-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: 'none',
                          color: 'var(--color-forest)',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Store size={18} color="var(--color-grass)" />
                          {m.name || 'Community Farmers Market'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-grass)' }}>View Stall Location →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </SlideUp>
            )}
          </div>

          {/* Right Map Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SlideUp delay={0.2}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--color-forest)' }}>Farmstead Location</h3>
                <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <MapView markers={farmerMarker} height="320px" center={coordinates} />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <DirectionsButton coordinates={coordinates} address={farmer.address} label="Driving Directions to Farm" />
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </div>

      {/* 3. Products by this farmer */}
      <div className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-leaf" style={{ marginBottom: '0.4rem' }}>
              Field Harvest
            </span>
            <h2 style={{ margin: 0, color: 'var(--color-forest)' }}>Seasonal Produce & Artisan Goods</h2>
          </div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <CountUp target={products.length} suffix=" items listed" />
          </span>
        </div>

        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>This farmer hasn't listed any products yet.</p>
        ) : (
          <div className="grid-products">
            {products.map((product, idx) => (
              <SlideUp key={product._id} delay={idx * 0.05}>
                <ScaleOnHover scale={1.02}>
                  <ProductCard product={product} index={idx} />
                </ScaleOnHover>
              </SlideUp>
            ))}
          </div>
        )}
      </div>

      {/* 4. Customer Reviews */}
      <div className="container-wide">
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
            Community Feedback
          </span>
          <h2 style={{ margin: 0, color: 'var(--color-forest)' }}>Patron Reviews & Comments</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No reviews yet. Be the first to leave feedback after your market pickup!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reviews.map((rev, idx) => (
              <SlideUp key={rev._id || idx} delay={idx * 0.08}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2px', color: '#ffb703' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? '#ffb703' : 'none'} color="#ffb703" />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-forest)', marginTop: '0.75rem' }}>
                    — {rev.customer?.name || 'Verified Patron'}
                  </div>

                  {rev.farmerResponse && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--color-leaf-soft)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        borderLeft: '3px solid var(--color-grass)',
                      }}
                    >
                      <strong style={{ color: 'var(--color-grass)' }}>Farmer reply:</strong> {rev.farmerResponse}
                    </div>
                  )}
                </div>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
