import React, { useState, useEffect } from 'react';
import { Store, MapPin, Compass, Phone, Calendar, Save, CheckCircle2 } from 'lucide-react';
import farmerService from '../../services/farmerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FadeIn, SlideUp } from '../../Animation';

export default function FarmerProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [bio, setBio] = useState('');
  const [latitude, setLatitude] = useState('44.0521');
  const [longitude, setLongitude] = useState('-123.0868');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await farmerService.getMyProfile();
        if (data) {
          setBusinessName(data.businessName || '');
          setContactNumber(data.contactNumber || user?.contactNumber || '');
          setFarmAddress(data.farmAddress || '');
          setBio(data.bio || '');
          if (data.location?.coordinates) {
            setLongitude(String(data.location.coordinates[0]));
            setLatitude(String(data.location.coordinates[1]));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await farmerService.updateMyProfile({
        businessName,
        contactNumber,
        farmAddress,
        bio,
      });

      // Update location pin
      await farmerService.updateMyLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        farmAddress
      );

      showToast?.('Stall details and map location pin updated!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
            Vendor Profile & Map Coordinates
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Farm Stall Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Set your public stall story and pin location shown on the interactive geospatial Google Map.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Business or Stall Name
              </label>
              <input
                type="text"
                required
                className="input"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Stall Contact Phone
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
                Physical Farm / Pickup Address
              </label>
              <input
                type="text"
                required
                className="input"
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* GPS Pin Coordinates */}
            <div style={{ backgroundColor: 'var(--color-leaf-soft)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(64,105,28,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Compass size={18} color="var(--color-grass)" />
                <strong style={{ color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                  Live Google Map Coordinates (2dsphere Pin)
                </strong>
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                These GPS coordinates place your farm pin on the interactive Map Locator so customers can calculate directions.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.25rem' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="input"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.25rem' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="input"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                About Your Farm & Growing Practices
              </label>
              <textarea
                rows={4}
                className="input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: 'fit-content', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <Save size={18} />
              {saving ? 'Updating...' : 'Save Stall Profile'}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
