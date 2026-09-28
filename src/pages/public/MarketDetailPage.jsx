import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Store,
  Sprout,
  ShoppingBag,
  Heart,
  ChevronLeft,
  Share2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import marketService from '../../services/marketService';
import productService from '../../services/productService';
import favoriteService from '../../services/favoriteService';
import { getMarketImage, ASSETS } from '../../utils/assets';
import { MapView, DirectionsButton } from '../../components/maps/MapView';
import ProductCard from '../../components/products/ProductCard';
import FarmerCard from '../../components/farmer/FarmerCard';
import { LoadingSkeleton, ErrorState } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
} from '../../Animation';

export default function MarketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [market, setMarket] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadMarket() {
      try {
        setLoading(true);
        setError(null);

        const marketData = await marketService.getMarketById(id);
        setMarket(marketData);

        // Fetch products available at this market
        const prodData = await productService.getProducts({ market: id });
        setProducts(prodData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMarket();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast('Please sign in to save favorite markets', 'info');
      return;
    }
    try {
      setIsFavorite(!isFavorite);
      await favoriteService.toggleMarket(id);
      showToast(isFavorite ? 'Removed from favorites' : 'Market saved to favorites', 'success');
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

  if (error || !market) {
    return (
      <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
        <ErrorState title="Market not found" message={error || 'Could not locate market information.'} />
      </div>
    );
  }

  const coordinates = {
    lat: market.location?.coordinates?.[1] || 44.05,
    lng: market.location?.coordinates?.[0] || -123.04,
  };

  const marketMarker = [
    {
      id: market._id,
      type: 'market',
      name: market.name,
      businessName: market.name,
      address: `${market.address}, ${market.city}`,
      coordinates,
    },
  ];

  const farmers = market.associatedFarmers || [];

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
          src={getMarketImage(market)}
          alt={market.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
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
                to="/markets"
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
                <ChevronLeft size={16} /> All Markets
              </Link>
              <h1 style={{ color: '#faf9f6', fontSize: 'clamp(2rem, 4vw, 2.75rem)', margin: 0, lineHeight: 1.15 }}>
                {market.name}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'rgba(250,249,246,0.9)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={16} color="var(--color-leaf)" />
                  {market.address}, {market.city}, {market.state} {market.zipCode}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={16} color="var(--color-leaf)" />
                  {Array.isArray(market.marketDays) ? market.marketDays.join(', ') : 'Weekly'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={16} color="var(--color-leaf)" />
                  {market.operatingHours}
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
                <span>{isFavorite ? 'Saved' : 'Save Market'}</span>
              </button>
              <DirectionsButton coordinates={coordinates} address={market.address} />
            </div>
          </SlideUp>
        </div>
      </div>

      {/* 2. Overview & Details */}
      <div className="container-wide">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Left Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SlideUp delay={0.1}>
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-forest)' }}>About the Market</h3>
                <p style={{ lineHeight: '1.7', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {market.description ||
                    'A vibrant gathering of organic farmers, artisan bakers, and local producers offering fresh season produce, handcrafted honey, and goods.'}
                </p>

                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-leaf-soft)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid rgba(144,169,85,0.25)',
                  }}
                >
                  <Store size={28} color="var(--color-grass)" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-forest)' }}>
                      In-Person Stall Pickup
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Browse products from participating stalls, pre-order for scheduled morning slots, and pay directly at the vendor table.
                    </p>
                  </div>
                </div>
              </div>
            </SlideUp>

            {/* Participating Farmers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--color-forest)' }}>Attending Farmers & Stalls</h3>
                <span className="badge badge-grass">
                  <CountUp target={farmers.length} suffix=" Growers" />
                </span>
              </div>

              {farmers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No farmers associated with this market yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {farmers.map((farmer, idx) => (
                    <SlideUp key={farmer._id || idx} delay={idx * 0.06}>
                      <ScaleOnHover scale={1.02}>
                        <FarmerCard farmer={farmer} index={idx} />
                      </ScaleOnHover>
                    </SlideUp>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Map Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SlideUp delay={0.2}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--color-forest)' }}>Market Location & Map</h3>
                <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <MapView markers={marketMarker} height="320px" center={coordinates} />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <DirectionsButton coordinates={coordinates} address={market.address} label="Open in Google Maps" />
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </div>

      {/* 3. Products available at this market */}
      <div className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-grass" style={{ marginBottom: '0.4rem' }}>
              Market Catalog
            </span>
            <h2 style={{ margin: 0, color: 'var(--color-forest)' }}>Fresh Products Available Here</h2>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">
            <span>View All Produce</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Products for this market will appear here soon.</p>
        ) : (
          <div className="grid-products">
            {products.slice(0, 8).map((product, idx) => (
              <SlideUp key={product._id} delay={idx * 0.05}>
                <ScaleOnHover scale={1.02}>
                  <ProductCard product={product} index={idx} />
                </ScaleOnHover>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
