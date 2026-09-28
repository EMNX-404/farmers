import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { getMarketImage } from '../../utils/assets';

export default function MarketCard({ market, index = 0, distanceKm }) {
  const imgSrc = getMarketImage(market, index);

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
      {/* Market Image */}
      <Link
        to={`/markets/${market._id}`}
        style={{
          position: 'relative',
          display: 'block',
          height: '200px',
          overflow: 'hidden',
          backgroundColor: '#f5f4ef',
        }}
      >
        <img
          src={imgSrc}
          alt={market.name}
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
          <span className="badge badge-forest" style={{ fontSize: '0.72rem' }}>
            Open Market
          </span>
        </div>

        {distanceKm !== undefined && (
          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
            <span className="badge badge-leaf" style={{ fontSize: '0.72rem' }}>
              {distanceKm} km away
            </span>
          </div>
        )}
      </Link>

      {/* Market Details */}
      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.6rem' }}>
        <Link to={`/markets/${market._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {market.name}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={15} color="var(--color-grass)" style={{ flexShrink: 0 }} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {market.address}, {market.city}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <Calendar size={15} color="var(--color-grass)" style={{ flexShrink: 0 }} />
          <span>
            {Array.isArray(market.marketDays) ? market.marketDays.join(', ') : 'Weekly'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <Clock size={15} color="var(--color-grass)" style={{ flexShrink: 0 }} />
          <span>{market.operatingHours || '8:00 AM - 1:00 PM'}</span>
        </div>

        {market.description && (
          <p
            style={{
              margin: '0.4rem 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {market.description}
          </p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Link
            to={`/markets/${market._id}`}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>View Stalls & Schedule</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
