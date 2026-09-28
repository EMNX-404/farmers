import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Store, MapPin, ArrowRight } from 'lucide-react';
import { getFarmerImage } from '../../utils/assets';

export default function FarmerCard({ farmer, index = 0, distanceMiles }) {
  const imgSrc = getFarmerImage(farmer, index);
  const markets = farmer.markets || [];

  return (
    <div
      className="card card-hover animate-fade"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <Link
        to={`/farmers/${farmer._id}`}
        style={{
          position: 'relative',
          display: 'block',
          height: '190px',
          overflow: 'hidden',
          backgroundColor: '#f5f4ef',
        }}
      >
        <img
          src={imgSrc}
          alt={farmer.businessName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className="badge badge-leaf" style={{ fontSize: '0.72rem' }}>
            Verified Grower
          </span>
        </div>

        {farmer.ratingAverage > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '0.2rem 0.5rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Star size={13} fill="#e67e22" color="#e67e22" />
            <span>{farmer.ratingAverage.toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({farmer.ratingCount || 0})</span>
          </div>
        )}
      </Link>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
        <Link to={`/farmers/${farmer._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {farmer.businessName}
          </h3>
        </Link>

        {farmer.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <MapPin size={14} color="var(--color-grass)" />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {farmer.address}
            </span>
          </div>
        )}

        {markets.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Store size={14} color="var(--color-moss)" />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              Attends: {markets.map((m) => m.name || m).join(', ')}
            </span>
          </div>
        )}

        {farmer.description && (
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.45',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {farmer.description}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Link
            to={`/farmers/${farmer._id}`}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Visit Stall & Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
