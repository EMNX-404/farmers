import React, { useState, useEffect } from 'react';
import FarmersMap from '../../components/maps/FarmersMap';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Compass } from 'lucide-react';
import apiClient from '../../services/apiClient';

export default function MapPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('AIzaSyAR7A1khhFmYm88HLvLzpD3ly6ql9M3nbs');
  const token = apiClient.getToken();

  useEffect(() => {
    fetch('/api/maps/config')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.apiKey) {
          setApiKey(res.data.apiKey);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-moss">Interactive Geospatial Map</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Compass className="w-8 h-8 text-emerald-600" />
          Farmers Market & Farm Pin Locator
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.4rem', fontSize: '1rem' }}>
          Explore real farm pins, nearby markets, calculate driving directions, and filter vendors by operating day.
        </p>
      </div>

      <FarmersMap
        apiKey={apiKey}
        authToken={token}
        currentUser={user}
      />
    </div>
  );
}
