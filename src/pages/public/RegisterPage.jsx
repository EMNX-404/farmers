import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, Sprout, ShoppingBag, Mail, Lock, Phone, MapPin, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ASSETS } from '../../utils/assets';
import { FadeIn, SlideUp } from '../../Animation';

export default function RegisterPage() {
  const { registerCustomer, registerFarmer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer'); // 'customer' | 'farmer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  // Farmer specific fields
  const [businessName, setBusinessName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [bio, setBio] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === 'customer') {
        const payload = {
          name,
          email,
          password,
          contactNumber,
          address,
        };
        await registerCustomer(payload);
        showToast?.('Welcome to MarketLink! Your customer account is active.', 'success');
        navigate('/customer/dashboard');
      } else {
        const payload = {
          name,
          email,
          password,
          contactNumber,
          businessName,
          farmAddress: farmAddress || address,
          bio,
        };
        await registerFarmer(payload);
        showToast?.('Farmer account registered! You can now manage your stall and weekly harvests.', 'success');
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the entered fields.');
      showToast?.(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', padding: '3.5rem 1.5rem' }}>
      <div className="container-narrow" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <FadeIn>
          <div className="card" style={{ padding: '2.5rem 3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-leaf" style={{ marginBottom: '0.5rem' }}>
                Join the Network
              </span>
              <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest)', margin: '0.25rem 0' }}>
                Create Your Account
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Pre-order fresh harvests or list your farm stall on MarketLink.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                backgroundColor: 'var(--color-white)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '2rem',
              }}
            >
              <button
                type="button"
                onClick={() => setRole('customer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: role === 'customer' ? '700' : '500',
                  backgroundColor: role === 'customer' ? 'var(--color-forest)' : 'transparent',
                  color: role === 'customer' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ShoppingBag size={18} />
                <span>Market Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('farmer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: role === 'farmer' ? '700' : '500',
                  backgroundColor: role === 'farmer' ? 'var(--color-forest)' : 'transparent',
                  color: role === 'farmer' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Sprout size={18} />
                <span>Farmer / Producer</span>
              </button>
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

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Emma Watson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="emma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="input"
                  placeholder="+1 (555) 019-2834"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              {/* Role specific fields */}
              {role === 'farmer' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                      Farm or Business Name
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g. Pine Ridge Organic Orchard"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                      Farm Physical Address
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="1400 Country Valley Rd, Springfield"
                      value={farmAddress}
                      onChange={(e) => setFarmAddress(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                      Farm Story / Bio
                    </label>
                    <textarea
                      rows={2}
                      className="input"
                      placeholder="Tell customers about your growing practices, heritage crops, or family history..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Primary Neighborhood or Address
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="742 Evergreen Terrace (Optional)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              )}

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
                {loading ? 'Registering...' : role === 'farmer' ? 'Register Farm Stall' : 'Create Customer Account'}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-grass)', fontWeight: '700' }}>
                Sign In
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
