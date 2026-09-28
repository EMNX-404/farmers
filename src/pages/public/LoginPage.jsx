import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Key, Mail, Lock, ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ASSETS } from '../../utils/assets';
import { FadeIn, SlideUp } from '../../Animation';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || null;

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      showToast?.(`Welcome back, ${res.user?.name || 'Patron'}!`, 'success');

      if (from) {
        navigate(from, { replace: true });
      } else if (res.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user?.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
      showToast?.(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '3rem 1.5rem' }}>
      <div className="container-wide" style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <FadeIn>
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Left side: Editorial Image & Brand */}
            <div
              style={{
                position: 'relative',
                background: 'var(--color-forest)',
                color: '#fff',
                padding: '3rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url("${ASSETS.heroes[0]}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.28,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <img src={ASSETS.logo} alt="Logo" style={{ height: '36px', borderRadius: '6px' }} />
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--color-leaf)' }}>
                    MarketLink
                  </span>
                </div>
                <h2 style={{ fontSize: '2.1rem', color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
                  Support local growers, taste the difference.
                </h2>
                <p style={{ color: 'rgba(250,249,246,0.85)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Pre-order your weekly produce boxes, reserve fresh sourdough, and pick up directly from verified neighborhood farm stalls.
                </p>
              </div>

              {/* Quick Credentials Widget */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  marginTop: '2rem',
                  backgroundColor: 'rgba(27,46,22,0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(236,243,158,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-leaf)', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                  <Key size={14} /> 1-Click Test Credentials
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('farmer.bob@marketlink.local', 'MarketLink2026!')}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    👨‍🌾 <strong>Farmer Bob</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-leaf)' }}>Green Valley</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('customer.emma@marketlink.local', 'MarketLink2026!')}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    🛒 <strong>Customer Emma</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-leaf)' }}>Patron with orders</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('farmer.alice@marketlink.local', 'MarketLink2026!')}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    👩‍🌾 <strong>Farmer Alice</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-leaf)' }}>Sunrise Orchards</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@marketlink.local', 'MarketLink2026!')}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    🛡️ <strong>Admin</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-leaf)' }}>Platform Control</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Login Form */}
            <div style={{ padding: '3.5rem 3rem', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                <span className="badge badge-moss" style={{ marginBottom: '0.5rem' }}>Welcome Back</span>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-forest)', margin: '0.25rem 0' }}>Sign In</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Access your pre-orders, stall catalog, or administrator tools.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: 'var(--color-error-soft)',
                    border: '1px solid #f5c6cb',
                    color: 'var(--color-error)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      className="input"
                      placeholder="you@marketlink.local"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.4rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      required
                      className="input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <LogIn size={18} />
                  {loading ? 'Authenticating...' : 'Sign In to MarketLink'}
                </button>
              </form>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--color-grass)', fontWeight: '700' }}>
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
