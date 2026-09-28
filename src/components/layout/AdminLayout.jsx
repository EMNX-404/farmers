import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  Sprout,
  Package,
  Layers,
  Megaphone,
  BarChart3,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { MarketLinkAIAssistant } from '../ai/MarketLinkAI';

export default function AdminLayout() {
  const { user } = useAuth();
  const [aiOpen, setAiOpen] = React.useState(false);

  const adminNavLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Farmers Queue', path: '/admin/farmers', icon: Sprout },
    { label: 'Markets', path: '/admin/markets', icon: Store },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'All Orders', path: '/admin/orders', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-white)' }}>
      <Navbar onOpenAI={() => setAiOpen(true)} />

      {/* Admin Sub-Nav Bar */}
      <div style={{ backgroundColor: 'var(--color-forest-dark)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.6rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} color="var(--color-leaf)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-leaf)', fontWeight: '700' }}>
              Platform Administrator
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {adminNavLinks.map((item) => {
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
                    backgroundColor: isActive ? 'rgba(236,243,158,0.2)' : 'transparent',
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
