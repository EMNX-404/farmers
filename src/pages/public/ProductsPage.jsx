import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X, Sparkles, ShoppingBag, Sprout, Check } from 'lucide-react';
import productService from '../../services/productService';
import marketService from '../../services/marketService';
import ProductCard from '../../components/products/ProductCard';
import { LoadingSkeleton, EmptyState, ErrorState } from '../../components/common/StateViews';
import { ASSETS } from '../../utils/assets';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  InfiniteSpiral,
} from '../../Animation';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('available');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, mkts] = await Promise.all([
          productService.getCategories(),
          marketService.getMarkets(),
        ]);
        setCategories(cats || []);
        setMarkets(mkts || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedMarket) params.market = selectedMarket;
      if (maxPrice) params.maxPrice = maxPrice;
      if (availability) params.availabilityStatus = availability;

      const data = await productService.getProducts(params);
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedMarket, maxPrice, availability]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedMarket('');
    setMaxPrice('');
    setAvailability('available');
  };

  const marqueeProduce = [
    { src: ASSETS.produce[0], alt: 'Honeycrisp Apples' },
    { src: ASSETS.produce[1], alt: 'Organic Roma Tomatoes' },
    { src: ASSETS.produce[2], alt: 'Meyer Lemons' },
    { src: ASSETS.produce[3], alt: 'Fresh Berry Harvest' },
    { src: ASSETS.produce[4], alt: 'Wildflower Honey' },
    { src: ASSETS.produce[5], alt: 'Crisp Bell Peppers' },
    { src: ASSETS.produce[6], alt: 'Baby Spinach' },
    { src: ASSETS.produce[7], alt: 'Farm Fresh Eggs' },
  ];

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* 1. Header with Badges and CountUps */}
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }} className="badge badge-grass">
              <Sparkles size={14} />
              <span>Fresh Harvest Catalog</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: 'var(--color-forest)', margin: 0 }}>
              Browse Fresh Local Produce
            </h1>
            <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Reserve heirloom crops, fresh greens, and artisan specialties directly for weekend market pickup.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                <CountUp target={products.length || 18} suffix="" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>In-Stock Items</div>
            </div>
            <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-grass)' }}>
                <CountUp target={100} suffix="%" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Zero Card Surcharges</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 2. Infinite Spiral Produce Marquee */}
      <SlideUp delay={0.15}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-grass)' }}>
              ✦ Live Harvest Stream • Freshly Picked This Week
            </span>
          </div>
          <InfiniteSpiral items={marqueeProduce} speed={0.65} />
        </div>
      </SlideUp>

      {/* 3. Categories Interactive Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('')}
          className={`filter-chip ${selectedCategory === '' ? 'filter-chip-active' : ''}`}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => setSelectedCategory(cat._id === selectedCategory ? '' : cat._id)}
            className={`filter-chip ${selectedCategory === cat._id ? 'filter-chip-active' : ''}`}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 4. Filter Bar */}
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
              placeholder="Search produce, honey, greens, herbs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Market Selector */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '170px' }}
          >
            <option value="">All Pickup Markets</option>
            {markets.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">All Items</option>
            <option value="available">In Stock Only</option>
            <option value="sold_out">Sold Out Only</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(search || selectedCategory || selectedMarket || availability !== 'available') && (
          <button
            onClick={handleResetFilters}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* 5. Products Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height={340} />
      ) : error ? (
        <ErrorState title="Failed to load produce" message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No produce found matching your search"
          description="Try broadening your category or search terms, or check back on Thursday when growers publish weekly harvests."
          actionLabel="Show All Produce"
          onAction={handleResetFilters}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {products.map((product, idx) => (
            <SlideUp key={product._id || idx} delay={idx * 0.05}>
              <ScaleOnHover scale={1.02}>
                <ProductCard product={product} />
              </ScaleOnHover>
            </SlideUp>
          ))}
        </div>
      )}
    </div>
  );
}
