import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  PackageCheck,
  CalendarDays,
  Clock,
  Store,
  Star,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { MarketLinkAIAssistant } from '../ai/MarketLinkAI';

export default function FarmerLayout() {
  const { user } = useAuth();
  const [aiOpen, setAiOpen] = React.useState(false);

  const farmerNavLinks = [
    { label: 'Overview', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'Produce Catalog', path: '/farmer/products', icon: Sprout },
    { label: 'Pre-Orders Queue', path: '/farmer/orders', icon: PackageCheck },
    { label: 'Harvest Inventory', path: '/farmer/inventory', icon: CalendarDays },
    { label: 'Pickup Windows', path: '/farmer/pickup-slots', icon: Clock },
    { label: 'Stall Profile & Pin', path: '/farmer/profile', icon: Store },
    { label: 'Patron Reviews', path: '/farmer/reviews', icon: Star },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-white)' }}>
      <Navbar onOpenAI={() => setAiOpen(true)} />

      {/* Farmer Stall Sub-Nav Bar */}
      <div style={{ backgroundColor: 'var(--color-forest)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.6rem 1.5rem' }}>
          {/* Stall Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-leaf)' }}>
              Farmer Management:
            </span>
            <strong style={{ fontSize: '0.92rem', color: '#fff' }}>
              {user?.farmerProfile?.businessName || user?.name || 'Local Farm Stall'}
            </strong>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {farmerNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? '700' : '500',
                    backgroundColor: isActive ? 'rgba(236,243,158,0.18)' : 'transparent',
                    color: isActive ? 'var(--color-leaf)' : 'rgba(250,249,246,0.85)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <main style={{ flex: 1, width: '100%' }}>
        <Outlet context={{ onOpenAI: () => setAiOpen(true) }} />
      </main>

      <Footer />
      <MarketLinkAIAssistant isOpen={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}
