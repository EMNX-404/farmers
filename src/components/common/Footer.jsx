import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../utils/assets';
import { MapPin, Heart, ShieldCheck, Sparkles, Sprout, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-forest)',
        color: 'var(--color-white)',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            paddingBottom: '3.5rem',
            borderBottom: '1px solid rgba(250, 249, 246, 0.15)',
          }}
        >
          {/* Col 1: Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={ASSETS.logo}
                alt="MarketLink Logo"
                style={{ height: '40px', borderRadius: '8px', background: '#faf9f6', padding: '2px' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  color: 'var(--color-leaf)',
                  letterSpacing: '-0.02em',
                }}
              >
                MarketLink
              </span>
            </div>
            <p style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Connecting conscious shoppers with local farmers and neighborhood markets. Discover fresh harvest, pre-order in advance, and pick up in person.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-leaf)', fontSize: '0.85rem' }}>
              <Sprout size={16} />
              <span>Zero online payment fees • In-person cash pickup</span>
            </div>
          </div>

          {/* Col 2: Marketplace Discovery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ color: 'var(--color-leaf)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore
            </h4>
            <Link to="/markets" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Find Local Markets
            </Link>
            <Link to="/farmers" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Meet the Farmers
            </Link>
            <Link to="/products" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Browse Fresh Produce
            </Link>
            <Link to="/about" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Our Farming Philosophy
            </Link>
          </div>

          {/* Col 3: Portals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ color: 'var(--color-leaf)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portals
            </h4>
            <Link to="/customer/dashboard" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Customer Account & Orders
            </Link>
            <Link to="/farmer/dashboard" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Farmer Stall Dashboard
            </Link>
            <Link to="/admin/dashboard" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Administrator Console
            </Link>
            <Link to="/register" style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.9rem' }} className="footer-link">
              Become a Verified Vendor
            </Link>
          </div>

          {/* Col 4: Pre-Order Model */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--color-leaf)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              How Pickup Works
            </h4>
            <p style={{ color: 'rgba(250, 249, 246, 0.8)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              1. Choose fresh produce from participating stalls.<br />
              2. Reserve a pickup slot on market day.<br />
              3. Farmers harvest & pack fresh.<br />
              4. Pay in cash or stall card at pickup.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ecf39e', fontSize: '0.8rem' }}>
              <Clock size={14} />
              <span>Saturday & Sunday pickup windows</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '2rem',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'rgba(250, 249, 246, 0.6)',
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} MarketLink Platform. Real Local Produce • In-Person Cash Pre-Orders.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/about" style={{ color: 'inherit' }}>About</Link>
            <Link to="/contact" style={{ color: 'inherit' }}>Contact & Help</Link>
            <Link to="/markets" style={{ color: 'inherit' }}>Locations</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--color-leaf) !important;
          transform: translateX(3px);
        }
      `}</style>
    </footer>
  );
}
