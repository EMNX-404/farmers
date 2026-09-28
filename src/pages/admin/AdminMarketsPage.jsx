import React, { useState, useEffect } from 'react';
import { Store, Plus, MapPin, Calendar, Clock, Edit, X } from 'lucide-react';
import marketService from '../../services/marketService';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';
import { ASSETS } from '../../utils/assets';

export default function AdminMarketsPage() {
  const { showToast } = useToast();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [marketDays, setMarketDays] = useState('Saturday, Sunday');
  const [operatingHours, setOperatingHours] = useState('8:00 AM - 1:00 PM');
  const [saving, setSaving] = useState(false);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const data = await marketService.getMarkets();
      setMarkets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        address,
        city,
        state,
        zipCode: '97477',
        marketDays: marketDays.split(',').map((d) => d.trim()),
        operatingHours,
        location: {
          type: 'Point',
          coordinates: [-123.02, 44.05],
        },
      };

      const created = await marketService.createMarket(payload);
      setMarkets([...markets, created]);
      setModalOpen(false);
      setName('');
      setDescription('');
      setAddress('');
      showToast?.('New market created successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to create market', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Locations & Schedules
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Community Markets
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Manage physical market pavilions, opening hours, and vendor stall allotments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={18} /> Add New Market
          </button>
        </div>

        {/* Markets Grid */}
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {markets.map((mkt, idx) => (
              <div
                key={mkt._id || idx}
                className="card"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  padding: 0,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <img
                  src={mkt.imageUrl || ASSETS.stalls[idx % ASSETS.stalls.length]}
                  alt={mkt.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', margin: 0 }}>
                      {mkt.name}
                    </h3>
                    <span className="badge badge-grass" style={{ fontSize: '0.72rem' }}>
                      Active
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    {mkt.description || 'Historic local open-air farmers market.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} color="var(--color-grass)" />
                      <span>{mkt.address}, {mkt.city}, {mkt.state}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} color="var(--color-grass)" />
                      <span>Operating Days: <strong>{mkt.marketDays?.join(', ')}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={15} color="var(--color-grass)" />
                      <span>Hours: {mkt.operatingHours || '8:00 AM - 1:00 PM'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Market Modal */}
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              className="card animate-scale-up"
              style={{
                width: '100%',
                maxWidth: '540px',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-forest)', margin: 0 }}>
                  Create New Community Market
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateMarket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                    Market Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Eastside Riverfront Market"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                    Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="800 River Promenade"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                      Market Days
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Saturday, Sunday"
                      value={marketDays}
                      onChange={(e) => setMarketDays(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="8:00 AM - 1:00 PM"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    placeholder="Describe the market atmosphere, parking, and vendor specialties..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Creating...' : 'Create Market'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
