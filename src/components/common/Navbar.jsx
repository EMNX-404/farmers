import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Sparkles,
  MapPin,
  Bell,
  Heart,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ASSETS } from '../../utils/assets';

export default function Navbar({ onOpenSearch, onOpenAI }) {
  const { user, isAuthenticated, isCustomer, isFarmer, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isFarmer) return '/farmer/dashboard';
    return '/customer/dashboard';
  };

  const navLinks = [
    { label: 'Markets', path: '/markets' },
    { label: 'Farmers', path: '/farmers' },
    { label: 'Products', path: '/products' },
    { label: 'Map', path: '/map' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`glass-nav ${scrolled ? 'glass-nav-scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        padding: scrolled ? '0.65rem 0' : '1rem 0',
      }}
    >
      <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img
            src={ASSETS.logo}
            alt="MarketLink Logo"
            style={{
              height: scrolled ? '36px' : '42px',
              borderRadius: '8px',
              objectFit: 'contain',
              transition: 'height 0.3s ease',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: '800',
                color: 'var(--color-forest)',
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
              }}
            >
              Market<span style={{ color: 'var(--color-grass)' }}>Link</span>
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--color-moss)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Fresh Local Markets
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav-links"
        >
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--color-grass)' : 'var(--text-primary)',
                  position: 'relative',
                  padding: '0.25rem 0',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: 'var(--color-grass)',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Search */}
          <Link
            to="/products"
            className="btn-icon"
            title="Search fresh products"
            style={{ textDecoration: 'none' }}
          >
            <Search size={19} />
          </Link>

          {/* AI Assistant Quick Trigger */}
          {onOpenAI && (
            <button
              type="button"
              onClick={onOpenAI}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              title="Open MarketLink Gemini AI"
            >
              <Sparkles size={14} color="var(--color-forest)" />
              <span style={{ display: 'none' }} className="d-md-inline">AI Guide</span>
            </button>
          )}

          {/* Cart Icon (for Customer or Guest) */}
          <Link
            to="/customer/cart"
            className="btn-icon"
            style={{ position: 'relative', textDecoration: 'none' }}
            title="Pre-Order Pickup Cart"
          >
            <ShoppingBag size={20} color="var(--text-primary)" />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: 'var(--color-grass)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {/* Authenticated User Menu or Guest Auth Buttons */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-leaf-soft)',
                  border: '1px solid rgba(144, 169, 85, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--color-forest)',
                    color: '#faf9f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="d-md-block">
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', lineHeight: 1.1 }}>
                    {user?.name?.split(' ')[0]}
                  </p>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-grass)', fontWeight: '700' }}>
                    {user?.role}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--color-forest)" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  className="card animate-fade"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    padding: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--color-border)' }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{user?.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>

                  <div style={{ padding: '0.4rem 0' }}>
                    <Link
                      to={getDashboardRoute()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}
                      className="btn-ghost"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>

                    {isCustomer && (
                      <>
                        <Link
                          to="/customer/orders"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                          }}
                          className="btn-ghost"
                        >
                          <ShoppingBag size={16} />
                          My Orders
                        </Link>
                        <Link
                          to="/customer/favorites"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                          }}
                          className="btn-ghost"
                        >
                          <Heart size={16} />
                          Favorites
                        </Link>
                        <Link
                          to="/customer/notifications"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                          }}
                          className="btn-ghost"
                        >
                          <Bell size={16} />
                          Notifications
                        </Link>
                      </>
                    )}

                    {isFarmer && (
                      <Link
                        to="/farmer/inventory"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.5rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                        }}
                        className="btn-ghost"
                      >
                        Weekly Inventory
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/reports"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.5rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                        }}
                        className="btn-ghost"
                      >
                        Platform Reports
                      </Link>
                    )}

                    <Link
                      to={isFarmer ? '/farmer/profile' : isCustomer ? '/customer/profile' : '/admin/dashboard'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}
                      className="btn-ghost"
                    >
                      <User size={16} />
                      Profile Settings
                    </Link>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--color-error)',
                        textAlign: 'left',
                      }}
                      className="btn-ghost"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="d-sm-flex">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon mobile-menu-btn"
            style={{ display: 'flex' }}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 0',
                }}
              >
                {item.label}
              </Link>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />

            {!isAuthenticated ? (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline" style={{ flex: 1 }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
                  Register
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to={getDashboardRoute()} className="btn btn-primary" style={{ width: '100%' }}>
                  Go to {user?.role} Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ width: '100%', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS helper for responsive display */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav-links { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .d-md-inline { display: inline !important; }
          .d-md-block { display: block !important; }
        }
        @media (min-width: 540px) {
          .d-sm-flex { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
