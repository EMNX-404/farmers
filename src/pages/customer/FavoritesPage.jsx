import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sprout, Store, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import favoriteService from '../../services/favoriteService';
import ProductCard from '../../components/products/ProductCard';
import FarmerCard from '../../components/farmer/FarmerCard';
import MarketCard from '../../components/markets/MarketCard';
import { FadeIn, SlideUp } from '../../Animation';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState({ products: [], farmers: [], markets: [] });
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'farmers' | 'markets'
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      setFavorites(data || { products: [], farmers: [], markets: [] });
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const currentList = favorites[activeTab] || [];

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-leaf" style={{ marginBottom: '0.4rem' }}>
            Personal Collection
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Saved Favorites
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Quickly check weekly harvest availability for your preferred growers and crops.
          </p>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.75rem',
            marginBottom: '2.5rem',
          }}
        >
          {[
            { id: 'products', label: `Favorite Products (${favorites.products?.length || 0})`, icon: ShoppingBag },
            { id: 'farmers', label: `Favorite Farmers (${favorites.farmers?.length || 0})`, icon: Sprout },
            { id: 'markets', label: `Saved Markets (${favorites.markets?.length || 0})`, icon: Store },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: isActive ? '700' : '500',
                  backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : currentList.length === 0 ? (
          <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <Heart size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-forest)', margin: 0 }}>No saved {activeTab} yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0.5rem auto 1.5rem', lineHeight: 1.6 }}>
              Tap the heart icon on any {activeTab === 'products' ? 'fresh fruit or vegetable' : activeTab === 'farmers' ? 'farm stall' : 'farmers market'} to save it here for fast pre-ordering.
            </p>
            <Link to={activeTab === 'products' ? '/products' : activeTab === 'farmers' ? '/farmers' : '/markets'} className="btn btn-primary">
              Explore {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {activeTab === 'products' &&
              currentList.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            {activeTab === 'farmers' &&
              currentList.map((frm) => (
                <FarmerCard key={frm._id || frm.id} farmer={frm} />
              ))}
            {activeTab === 'markets' &&
              currentList.map((mkt) => (
                <MarketCard key={mkt._id || mkt.id} market={mkt} />
              ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
