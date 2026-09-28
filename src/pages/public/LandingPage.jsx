import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Store,
  Sprout,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle,
  MapPin,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { ASSETS } from '../../utils/assets';
import marketService from '../../services/marketService';
import farmerService from '../../services/farmerService';
import productService from '../../services/productService';
import mapService from '../../services/mapService';
import ProductCard from '../../components/products/ProductCard';
import MarketCard from '../../components/markets/MarketCard';
import FarmerCard from '../../components/farmer/FarmerCard';
import { MapView } from '../../components/maps/MapView';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  BounceCards,
  InfiniteSpiral,
  AccordionGallery,
} from '../../Animation';

export default function LandingPage({ onOpenAI }) {
  const [markets, setMarkets] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [mkts, frms, prods, locations] = await Promise.allSettled([
          marketService.getMarkets(),
          farmerService.getFarmers(),
          productService.getProducts(),
          mapService.getFarmerLocations(),
        ]);

        if (mkts.status === 'fulfilled') setMarkets(mkts.value || []);
        if (frms.status === 'fulfilled') setFarmers(frms.value || []);
        if (prods.status === 'fulfilled') setProducts(prods.value || []);
        if (locations.status === 'fulfilled') setMapMarkers(locations.value || []);
      } catch (err) {
        console.error('Error loading landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const accordionItems = [
    {
      image: ASSETS.stalls[0],
      label: 'Downtown Central Market',
      description: 'Saturdays & Sundays • 24 Local Produce Stalls',
    },
    {
      image: ASSETS.stalls[1],
      label: 'Westside Green Market',
      description: 'Midweek Harvests • Organic Vegetables & Raw Honey',
    },
    {
      image: ASSETS.stalls[2],
      label: 'Sunrise Orchards Stall',
      description: 'Crisp Honeycrisp Apples & Raw Wildflower Honey',
    },
    {
      image: ASSETS.stalls[3],
      label: 'Green Valley Organic',
      description: 'Vine-Ripened Heirloom Tomatoes & Baby Greens',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '3rem' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          paddingTop: '2.5rem',
          paddingBottom: '4.5rem',
          background: 'linear-gradient(180deg, rgba(236,243,158,0.2) 0%, rgba(250,249,246,1) 100%)',
          overflow: 'hidden',
        }}
      >
        <div className="container-wide">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left Hero Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
              <FadeIn delay={0.1}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-leaf)',
                    border: '1px solid rgba(144,169,85,0.4)',
                    color: 'var(--color-forest)',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                  }}
                >
                  <Sparkles size={15} color="var(--color-forest)" />
                  <span>The Direct-from-Farm Marketplace</span>
                </div>
              </FadeIn>

              <SlideUp delay={0.2}>
                <h1 className="display-title" style={{ color: 'var(--color-forest)' }}>
                  Discover local farmers. <br />
                  <span style={{ color: 'var(--color-grass)' }}>Find fresh products.</span> <br />
                  Reserve for pickup.
                </h1>
              </SlideUp>

              <FadeIn delay={0.3}>
                <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '540px' }}>
                  Skip the supermarket middlemen. Browse authentic farmers markets, reserve seasonal produce directly from local growers, and pick up fresh with cash or card in person.
                </p>
              </FadeIn>

              {/* CTAs */}
              <FadeIn delay={0.4}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <Link to="/markets" className="btn btn-primary btn-lg">
                    <Store size={18} />
                    <span>Explore Markets</span>
                    <ArrowRight size={18} />
                  </Link>

                  <Link to="/register" className="btn btn-outline btn-lg">
                    <Sprout size={18} />
                    <span>Become a Farmer</span>
                  </Link>
                </div>
              </FadeIn>

              {/* Key Trust Signals */}
              <FadeIn delay={0.5}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color="var(--color-grass)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>In-Person Cash Pickup</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color="var(--color-grass)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Verified Farm Stalls</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color="var(--color-grass)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Live Weekend Inventory</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Hero Produce Visuals */}
            <div style={{ position: 'relative' }}>
              <SlideUp delay={0.3}>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-hover)',
                    border: '4px solid #ffffff',
                    maxHeight: '480px',
                  }}
                >
                  <img
                    src={ASSETS.heroes[0] || ASSETS.stalls[0]}
                    alt="Local Farmers Market"
                    style={{ width: '100%', height: '480px', objectFit: 'cover' }}
                  />

                  {/* Floating Metric Pill */}
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      padding: '0.85rem 1.25rem',
                      background: 'rgba(250, 249, 246, 0.95)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--color-grass)',
                        color: '#faf9f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sprout size={20} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-moss)' }}>
                        Direct From Farm
                      </p>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                        <CountUp target={markets.length || 2} suffix=" Markets Active" />
                      </p>
                    </div>
                  </div>
                </div>
              </SlideUp>

              {/* Bounce Cards Micro-Composition */}
              <div style={{ marginTop: '2rem', display: 'block', width: '100%', overflow: 'hidden' }}>
                <BounceCards
                  images={[
                    ASSETS.produce[0],
                    ASSETS.produce[1],
                    ASSETS.produce[2],
                    ASSETS.produce[3],
                    ASSETS.produce[4],
                  ]}
                  containerWidth={540}
                  containerHeight={220}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE PRODUCE MARQUEE */}
      <section style={{ backgroundColor: 'var(--color-white)', padding: '0 0 1rem 0' }}>
        <div className="container-wide">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-grass)', letterSpacing: '0.06em' }}>
              Fresh Harvest In Stock This Weekend
            </span>
            <Link to="/products" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Catalog <ArrowRight size={14} />
            </Link>
          </div>
          <InfiniteSpiral items={ASSETS.produce} speed={0.4} />
        </div>
      </section>

      {/* 3. NEARBY MARKETS */}
      <section className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-grass" style={{ marginBottom: '0.5rem' }}>
              Market Discovery
            </span>
            <h2>Nearby Farmers Markets</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Visit in person, experience the community, and pick up your pre-orders.
            </p>
          </div>
          <Link to="/markets" className="btn btn-outline btn-sm">
            <span>Browse All Markets</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-markets">
          {markets.slice(0, 3).map((market, idx) => (
            <SlideUp key={market._id || idx} delay={idx * 0.1}>
              <ScaleOnHover scale={1.02}>
                <MarketCard market={market} index={idx} />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      </section>

      {/* 4. ACCORDION STALL GALLERY */}
      <section className="container-wide">
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <span className="badge badge-moss">Visual Tour</span>
          <h2 style={{ marginTop: '0.5rem' }}>Experience the Stalls & Growers</h2>
          <p style={{ margin: '0.25rem auto 0 auto', maxWidth: '520px' }}>
            Hover over any stall to preview grower specialties, locations, and weekend market dates.
          </p>
        </div>
        <AccordionGallery items={accordionItems} height={380} defaultIndex={0} />
      </section>

      {/* 5. FEATURED FARMERS */}
      <section className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-leaf" style={{ marginBottom: '0.5rem' }}>
              Local Growers
            </span>
            <h2>Meet Our Featured Farmers</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Independent family growers offering certified organic, regenerative, and artisanal produce.
            </p>
          </div>
          <Link to="/farmers" className="btn btn-outline btn-sm">
            <span>All Farmers</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-farmers">
          {farmers.slice(0, 3).map((farmer, idx) => (
            <SlideUp key={farmer._id || idx} delay={idx * 0.1}>
              <ScaleOnHover scale={1.02}>
                <FarmerCard farmer={farmer} index={idx} />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      </section>

      {/* 6. FRESH PRODUCTS SHOWCASE */}
      <section className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-grass" style={{ marginBottom: '0.5rem' }}>
              Direct From The Soil
            </span>
            <h2>Fresh Products Ready For Pickup</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Hand-picked the morning of market. Reserve yours before stock runs out.
            </p>
          </div>
          <Link to="/products" className="btn btn-primary btn-sm">
            <span>Shop Full Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-products">
          {products.slice(0, 4).map((product, idx) => (
            <SlideUp key={product._id || idx} delay={idx * 0.08}>
              <ScaleOnHover scale={1.02}>
                <ProductCard product={product} index={idx} />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      </section>

      {/* 7. HOW MARKETLINK WORKS */}
      <section style={{ backgroundColor: 'var(--color-forest)', color: '#faf9f6', padding: '5rem 0' }}>
        <div className="container-wide">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(236, 243, 158, 0.2)',
                color: 'var(--color-leaf)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              The Modern Farmers Market
            </span>
            <h2 style={{ color: '#faf9f6', fontSize: '2.4rem', marginTop: '0.75rem' }}>
              How MarketLink Works
            </h2>
            <p style={{ color: 'rgba(250, 249, 246, 0.8)', maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
              Four simple steps from farm to table. Zero payment gateway hassle — pay cash or card at the stall.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                step: '01',
                title: 'Discover Markets',
                desc: 'Find open community markets, locations, and participating growers in your local area.',
                icon: <Store size={24} color="var(--color-leaf)" />,
              },
              {
                step: '02',
                title: 'Choose Produce',
                desc: 'Browse fresh heirloom produce, tree fruit, and honey directly from specific farm stalls.',
                icon: <Sprout size={24} color="var(--color-leaf)" />,
              },
              {
                step: '03',
                title: 'Pre-Order Pickup',
                desc: 'Reserve items for your preferred pickup date and time window with zero online payment fees.',
                icon: <ShoppingBag size={24} color="var(--color-leaf)" />,
              },
              {
                step: '04',
                title: 'Pick Up & Enjoy',
                desc: 'Arrive at the market stall, collect your freshly packed produce, pay in person, and review.',
                icon: <CheckCircle size={24} color="var(--color-leaf)" />,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="card"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(250, 249, 246, 0.15)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-leaf)', opacity: 0.5 }}>
                    {s.step}
                  </span>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(236, 243, 158, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {s.icon}
                  </div>
                </div>

                <h3 style={{ color: '#faf9f6', fontSize: '1.25rem', margin: 0 }}>{s.title}</h3>
                <p style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE MAP PREVIEW */}
      <section className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-grass" style={{ marginBottom: '0.5rem' }}>
              Interactive Map
            </span>
            <h2>Farm Stalls & Market Locations</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Explore real vendor farm pins, check distances, and get Google Maps turn-by-turn directions.
            </p>
          </div>
          <Link to="/markets" className="btn btn-outline btn-sm">
            <span>Explore All Locations</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <MapView
          markers={mapMarkers}
          height="450px"
          center={{ lat: 44.05, lng: -123.04 }}
        />
      </section>

      {/* 9. AI ASSISTANT PREVIEW */}
      <section className="container-wide">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(236,243,158,0.3) 0%, rgba(250,249,246,1) 60%, rgba(144,169,85,0.2) 100%)',
            border: '2px solid rgba(64,105,28,0.2)',
            padding: '3rem',
            borderRadius: 'var(--radius-xl)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                background: 'var(--color-forest)',
                color: 'var(--color-leaf)',
                fontSize: '0.8rem',
                fontWeight: '700',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} />
              <span>Grounded in MongoDB Catalog</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-forest)' }}>
              Ask the MarketLink AI Assistant
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '1rem 0 1.5rem 0' }}>
              Have questions about where to find organic produce, which market is open this weekend, or pickup time windows? Our assistant synthesizes answers directly from real farm inventory.
            </p>
            {onOpenAI && (
              <button
                type="button"
                onClick={onOpenAI}
                className="btn btn-primary btn-lg"
              >
                <Sparkles size={18} />
                <span>Open Assistant Now</span>
              </button>
            )}
          </div>

          {/* Example AI Questions Box */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h4 style={{ margin: 0, color: 'var(--color-grass)', fontSize: '0.95rem' }}>
              Try Asking Things Like:
            </h4>
            {[
              'Which markets are open Saturday and what produce is in stock?',
              'Where is Green Valley Organic Farm located?',
              'What honey products are available from Sunrise Orchards?',
              'Can I reserve items and pay cash when I arrive?',
            ].map((q, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-leaf-soft)',
                  border: '1px solid rgba(144,169,85,0.25)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--color-forest)',
                  cursor: 'pointer',
                }}
                onClick={onOpenAI}
              >
                "{q}"
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA BANNER */}
      <section className="container-wide">
        <div
          className="card"
          style={{
            backgroundColor: 'var(--color-forest)',
            color: '#faf9f6',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span
            style={{
              backgroundColor: 'rgba(236, 243, 158, 0.2)',
              color: 'var(--color-leaf)',
              padding: '0.35rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
          >
            Join the Local Food Movement
          </span>
          <h2 style={{ color: '#faf9f6', fontSize: 'clamp(2rem, 4vw, 3rem)', maxWidth: '720px', margin: 0 }}>
            Taste the Difference of Real, Locally Grown Produce.
          </h2>
          <p style={{ color: 'rgba(250, 249, 246, 0.85)', maxWidth: '580px', fontSize: '1.1rem', margin: 0 }}>
            Create a customer account to save favorites and pre-order, or register your farm stall to start accepting weekend pre-orders.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Link to="/register" className="btn btn-secondary btn-lg">
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-outline-white btn-lg">
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
