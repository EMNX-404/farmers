import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import { FadeIn, SlideUp } from '../../Animation';

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile({ name, contactNumber, address });
      showToast?.('Profile updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showToast?.('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast?.(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
            Account Settings
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Patron Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage your pre-order contact information and pickup preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)', fontSize: '1.5rem', fontWeight: '800' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', margin: 0 }}>
                {user?.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>{user?.email}</span>
                <span>•</span>
                <span className="badge badge-grass" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  {user?.role || 'Customer'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Contact Phone (Used for Pickup Notifications)
              </label>
              <input
                type="tel"
                required
                className="input"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Default Neighborhood / Address
              </label>
              <input
                type="text"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
              style={{ width: 'fit-content', padding: '0.75rem 1.75rem', marginTop: '0.5rem' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-forest)', marginBottom: '1.25rem' }}>
            Change Password
          </h3>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Current Password
              </label>
              <input
                type="password"
                required
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn btn-outline"
              style={{ width: 'fit-content', padding: '0.75rem 1.75rem', marginTop: '0.5rem' }}
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
