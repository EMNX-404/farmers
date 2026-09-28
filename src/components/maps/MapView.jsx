import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, Store, Sprout } from 'lucide-react';
import mapService from '../../services/mapService';

export function MapView({
  center = { lat: 44.05, lng: -123.04 },
  zoom = 12,
  markers = [],
  selectedMarkerId = null,
  onMarkerSelect,
  height = '420px',
  interactive = true,
}) {
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    if (selectedMarkerId) {
      const found = markers.find((m) => m.id === selectedMarkerId || m._id === selectedMarkerId);
      if (found) setActiveMarker(found);
    }
  }, [selectedMarkerId, markers]);

  // Compute map bounds or relative coordinates for pins
  const currentCenter = activeMarker?.coordinates || center;
  const lat = currentCenter.lat || 44.05;
  const lng = currentCenter.lng || -123.04;

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.12}%2C${lat - 0.08}%2C${lng + 0.12}%2C${lat + 0.08}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Real Interactive Map via OpenStreetMap Embed */}
      <iframe
        title="MarketLink Interactive Map"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={osmUrl}
        style={{ border: 0, filter: 'saturate(1.2)' }}
      />

      {/* Floating Marker Selector Bar (if markers provided) */}
      {markers.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            background: 'rgba(250, 249, 246, 0.94)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-grass)',
                color: '#faf9f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {activeMarker?.type === 'farmer' ? <Sprout size={16} /> : <Store size={16} />}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {activeMarker ? (activeMarker.businessName || activeMarker.name) : `${markers.length} Locations Available`}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {activeMarker?.address || 'Click any location to center on map'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {markers.slice(0, 3).map((m, idx) => {
              const isSelected = (activeMarker?.id || activeMarker?._id) === (m.id || m._id);
              return (
                <button
                  key={m.id || m._id || idx}
                  type="button"
                  onClick={() => {
                    setActiveMarker(m);
                    if (onMarkerSelect) onMarkerSelect(m);
                  }}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {m.businessName?.split(' ')[0] || m.name?.split(' ')[0] || `Spot ${idx + 1}`}
                </button>
              );
            })}

            {activeMarker?.coordinates && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeMarker.coordinates.lat || activeMarker.coordinates[1]},${activeMarker.coordinates.lng || activeMarker.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                title="Get Google Maps turn-by-turn directions"
              >
                <Navigation size={12} />
                Directions
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DirectionsButton({ coordinates, address, label = 'Get Directions' }) {
  if (!coordinates && !address) return null;

  const lat = coordinates?.lat || (Array.isArray(coordinates) ? coordinates[1] : null);
  const lng = coordinates?.lng || (Array.isArray(coordinates) ? coordinates[0] : null);

  const destination = lat && lng ? `${lat},${lng}` : encodeURIComponent(address || '');
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline btn-sm"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
    >
      <Navigation size={14} />
      {label}
      <ExternalLink size={12} style={{ opacity: 0.6 }} />
    </a>
  );
}

export function LocationPicker({
  initialLat = 44.05,
  initialLng = -123.04,
  onLocationChange,
}) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);

  const handleUpdate = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    if (onLocationChange) onLocationChange({ latitude: newLat, longitude: newLng });
  };

  return (
    <div className="card" style={{ padding: '1rem', background: 'var(--color-leaf-soft)', border: '1px solid rgba(144, 169, 85, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
        <MapPin size={18} color="var(--color-grass)" />
        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Farm Location Coordinates</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Latitude</label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => handleUpdate(parseFloat(e.target.value) || 0, lng)}
            className="form-input"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Longitude</label>
          <input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => handleUpdate(lat, parseFloat(e.target.value) || 0)}
            className="form-input"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Your farm stall will be plotted accurately for customer distance calculations.
      </p>
    </div>
  );
}
