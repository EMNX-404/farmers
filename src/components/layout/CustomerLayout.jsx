import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  Heart,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { MarketLinkAIAssistant } from '../ai/MarketLinkAI';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = React.useState(false);

  const customerNavLinks = [
    { label: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'My Cart', path: '/customer/cart', icon: ShoppingBag, badge: itemCount },
    { label: 'Pre-Orders', path: '/customer/orders', icon: Clock },
    { label: 'Saved Favorites', path: '/customer/favorites', icon: Heart },
    { label: 'Notifications', path: '/customer/notifications', icon: Bell },
    { label: 'Account Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-white)' }}>
      <Navbar onOpenAI={() => setAiOpen(true)} />

      {/* Customer Sub-Nav Bar */}
      <div style={{ backgroundColor: 'var(--color-forest)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.6rem 1.5rem' }}>
          {/* Welcome User Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-leaf)' }}>
              Patron Portal:
            </span>
            <strong style={{ fontSize: '0.92rem', color: '#fff' }}>
              {user?.name || 'Customer'}
            </strong>
          </div>

          {/* Customer Portal Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {customerNavLinks.map((item) => {
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
                  {item.badge > 0 && (
                    <span style={{ backgroundColor: 'var(--color-leaf)', color: 'var(--color-forest)', fontSize: '0.68rem', fontWeight: '800', borderRadius: '10px', padding: '0.05rem 0.4rem' }}>
                      {item.badge}
                    </span>
                  )}
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
