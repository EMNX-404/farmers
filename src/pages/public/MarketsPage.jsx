import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Map as MapIcon, List, Filter, Sparkles, Store, Users, Clock } from 'lucide-react';
import marketService from '../../services/marketService';
import MarketCard from '../../components/markets/MarketCard';
import { MapView } from '../../components/maps/MapView';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/common/StateViews';
import { ASSETS } from '../../utils/assets';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  FlexCarousel,
} from '../../Animation';

export default function MarketsPage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDay) params.day = selectedDay;

      const data = await marketService.getMarkets(params);
      setMarkets(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMarkets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedDay]);

  const days = ['Saturday', 'Sunday', 'Wednesday', 'Thursday', 'Friday'];

  const marketCarouselItems = [
    {
      src: ASSETS.stalls[0],
      title: 'Downtown Central Market',
      subtitle: 'Saturdays & Sundays 8:00 AM - 1:00 PM • 24 Local Produce Stalls',
    },
    {
      src: ASSETS.stalls[1],
      title: 'Westside Community Green',
      subtitle: 'Wednesdays 3:00 PM - 7:00 PM • Evening Harvests & Artisan Breads',
    },
    {
      src: ASSETS.stalls[2],
      title: 'Eastside Artisan Market',
      subtitle: 'Sundays 9:00 AM - 2:00 PM • Organic Fruits, Honey & Wild Mushrooms',
    },
    {
      src: ASSETS.stalls[3],
      title: 'Riverfront Farmers Plaza',
      subtitle: 'Saturdays 9:00 AM - 2:00 PM • Fresh Microgreens & Fresh Berries',
    },
  ];

  const mapMarkers = markets.map((m) => ({
    id: m._id,
    type: 'market',
    name: m.name,
    businessName: m.name,
    address: `${m.address}, ${m.city}`,
    coordinates: {
      lat: m.location?.coordinates?.[1] || 44.05,
      lng: m.location?.coordinates?.[0] || -123.04,
    },
  }));

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* 1. Header with Badges and CountUps */}
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }} className="badge badge-grass">
              <Sparkles size={14} />
              <span>Explore Markets</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: 'var(--color-forest)', margin: 0 }}>
              Local Farmers Markets
            </h1>
            <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Find fresh weekend and midweek open-air markets across Oregon and the Pacific Northwest.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                <CountUp target={markets.length || 4} suffix="" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Markets</div>
            </div>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-grass)' }}>
                <CountUp target={28} suffix="+" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Stall Vendors</div>
            </div>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-moss)' }}>
                <CountUp target={100} suffix="%" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>In-Person Pickup</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 2. Interactive FlexCarousel */}
      <SlideUp delay={0.15}>
        <div style={{ marginBottom: '2.5rem' }}>
          <FlexCarousel items={marketCarouselItems} cardHeight={420} autoplay={true} interval={5} captions={true} />
        </div>
      </SlideUp>

      {/* 3. Filter and View Controls Bar */}
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
              placeholder="Search markets by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Day Selector */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="">All Operating Days</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d} Markets
              </option>
            ))}
          </select>

          {selectedDay && (
            <button
              onClick={() => setSelectedDay('')}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.5rem 0.85rem' }}
            >
              Clear Day Filter
            </button>
          )}
        </div>

        {/* View Toggle (List vs Map) */}
        <div style={{ display: 'flex', background: 'var(--color-border)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: viewMode === 'list' ? '700' : '500',
              backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-forest)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <List size={16} /> List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: viewMode === 'map' ? '700' : '500',
              backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
              color: viewMode === 'map' ? 'var(--color-forest)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <MapIcon size={16} /> Map View
          </button>
        </div>
      </div>

      {/* 4. Content Area: List or Map */}
      {loading ? (
        <LoadingSkeleton count={3} height={280} />
      ) : error ? (
        <ErrorState title="Failed to load markets" message={error} onRetry={fetchMarkets} />
      ) : markets.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No markets match your criteria"
          description="Try clearing search filters or checking for other days of the week."
          actionLabel="Show All Markets"
          onAction={() => {
            setSearch('');
            setSelectedDay('');
          }}
        />
      ) : viewMode === 'map' ? (
        <div style={{ height: '620px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <MapView
            markers={mapMarkers}
            center={{ lat: 44.0521, lng: -123.0868 }}
            zoom={12}
            height="100%"
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {markets.map((market, idx) => (
            <SlideUp key={market._id || idx} delay={idx * 0.08}>
              <ScaleOnHover scale={1.02}>
                <MarketCard market={market} />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      )}
    </div>
  );
}
