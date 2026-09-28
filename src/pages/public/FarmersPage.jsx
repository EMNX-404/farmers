import React, { useState, useEffect } from 'react';
import { Search, Store, Filter, Sprout, Sparkles, Award, Star, Users, MapPin } from 'lucide-react';
import farmerService from '../../services/farmerService';
import marketService from '../../services/marketService';
import FarmerCard from '../../components/farmer/FarmerCard';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/common/StateViews';
import { ASSETS } from '../../utils/assets';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  BounceCards,
} from '../../Animation';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedMarket) params.market = selectedMarket;

      const data = await farmerService.getFarmers(params);
      setFarmers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMarkets() {
      try {
        const mkts = await marketService.getMarkets();
        setMarkets(mkts || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMarkets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFarmers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedMarket]);

  const growerHighlights = [
    ASSETS.heroes[0],
    ASSETS.stalls[2],
    ASSETS.stalls[3],
    ASSETS.stalls[1],
    ASSETS.produce[2],
  ];

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* 1. Header with Badges and CountUps */}
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }} className="badge badge-leaf">
              <Sparkles size={14} />
              <span>Meet the Growers</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: 'var(--color-forest)', margin: 0 }}>
              Local Farmers & Producers
            </h1>
            <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Connect directly with dedicated growers harvesting peak seasonal produce and artisan goods.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                <CountUp target={farmers.length || 6} suffix="" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Verified Growers</div>
            </div>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-grass)' }}>
                <CountUp target={100} suffix="%" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Local Family Farms</div>
            </div>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-moss)' }}>
                <CountUp target={4.9} suffix="★" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Patron Rating</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 2. Interactive BounceCards Showcase Banner */}
      <SlideUp delay={0.15}>
        <div
          className="card"
          style={{
            padding: '2.5rem 1.5rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(236,243,158,0.25) 0%, rgba(250,249,246,1) 100%)',
            textAlign: 'center',
            marginBottom: '2.5rem',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-grass)' }}>
            Hover Over Portraits & Crates
          </span>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--color-forest)', margin: '0.35rem 0 1.25rem' }}>
            Faces of the Harvest
          </h3>
          <BounceCards images={growerHighlights} containerWidth={560} containerHeight={260} />
        </div>
      </SlideUp>

      {/* 3. Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px' }}
            />
            <input
              type="text"
              placeholder="Search by farm or stall name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Market Filter */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">All Markets</option>
            {markets.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {selectedMarket && (
            <button
              onClick={() => setSelectedMarket('')}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.5rem 0.85rem' }}
            >
              Clear Market Filter
            </button>
          )}
        </div>
      </div>

      {/* 4. Farmers Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height={320} />
      ) : error ? (
        <ErrorState title="Failed to load farmers" message={error} onRetry={fetchFarmers} />
      ) : farmers.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No farmers match your criteria"
          description="Try broadening your search or choosing a different market."
          actionLabel="Show All Farmers"
          onAction={() => {
            setSearch('');
            setSelectedMarket('');
          }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {farmers.map((farmer, idx) => (
            <SlideUp key={farmer._id || idx} delay={idx * 0.08}>
              <ScaleOnHover scale={1.02}>
                <FarmerCard farmer={farmer} />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      )}
    </div>
  );
}
