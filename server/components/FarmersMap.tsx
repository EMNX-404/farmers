import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Store,
  Navigation,
  Search,
  Crosshair,
  ExternalLink,
  Star,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Compass,
  Building2,
  Phone,
  Layers,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export interface FarmerLocation {
  id: string;
  type: 'farmer';
  businessName: string;
  farmerName: string;
  address: string;
  contactNumber: string;
  description: string;
  ratingAverage: number;
  ratingCount: number;
  productCount: number;
  marketDays: string[];
  pickupWindows: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  markets: Array<{
    _id: string;
    name: string;
    address: string;
    operatingHours: string;
    marketDays: string[];
    location?: {
      coordinates: [number, number];
    };
  }>;
  directionsUrl: string;
}

export interface MarketLocation {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  marketDays: string[];
  operatingHours: string;
}

interface FarmersMapProps {
  apiKey: string;
  authToken?: string | null;
  currentUser?: any;
}

// Controller component inside APIProvider to smoothly pan/zoom map
function MapPanController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export default function FarmersMap({ apiKey, authToken, currentUser }: FarmersMapProps) {
  const defaultCenter = { lat: 44.05, lng: -123.03 };
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);

  const [farmers, setFarmers] = useState<FarmerLocation[]>([]);
  const [markets, setMarkets] = useState<MarketLocation[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerLocation | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketLocation | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>('all');
  const [showMarkets, setShowMarkets] = useState(true);
  const [showFarmers, setShowFarmers] = useState(true);

  // Proximity filter state
  const [radiusKm, setRadiusKm] = useState<number>(30);
  const [isProximityActive, setIsProximityActive] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Farmer update location state
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [editLat, setEditLat] = useState<number>(44.04);
  const [editLng, setEditLng] = useState<number>(-123.01);
  const [editAddress, setEditAddress] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  // Fetch farmers & markets
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [farmersRes, marketsRes] = await Promise.all([
        fetch('/api/maps/farmers'),
        fetch('/api/markets'),
      ]);

      const farmersJson = await farmersRes.json();
      const marketsJson = await marketsRes.json();

      if (farmersJson.success) {
        setFarmers(farmersJson.data || []);
      }

      if (marketsJson.success) {
        const formattedMarkets: MarketLocation[] = (marketsJson.data || []).map((m: any) => ({
          _id: m._id,
          name: m.name,
          address: m.address,
          city: m.city,
          state: m.state,
          zipCode: m.zipCode,
          coordinates: {
            lat: m.location?.coordinates?.[1] || defaultCenter.lat,
            lng: m.location?.coordinates?.[0] || defaultCenter.lng,
          },
          marketDays: m.marketDays || [],
          operatingHours: m.operatingHours || '',
        }));
        setMarkets(formattedMarkets);
      }
    } catch (err) {
      console.error('Failed to load map entities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // If authenticated as farmer, prefill their current coordinates for update
  useEffect(() => {
    if (currentUser?.farmerProfile && farmers.length > 0) {
      const myFarm = farmers.find((f) => f.id === currentUser.farmerProfile?._id || f.id === currentUser.farmerProfile);
      if (myFarm) {
        setEditLat(myFarm.coordinates.lat);
        setEditLng(myFarm.coordinates.lng);
        setEditAddress(myFarm.address);
      }
    }
  }, [currentUser, farmers]);

  // Filtered farmers list
  const filteredFarmers = farmers.filter((farmer) => {
    if (selectedMarketFilter !== 'all') {
      const attendsMarket = farmer.markets?.some((m) => m._id === selectedMarketFilter);
      if (!attendsMarket) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = farmer.businessName.toLowerCase().includes(q);
      const matchesAddress = farmer.address.toLowerCase().includes(q);
      const matchesDesc = farmer.description?.toLowerCase().includes(q);
      if (!matchesName && !matchesAddress && !matchesDesc) return false;
    }

    return true;
  });

  // Center on a specific farmer
  const handleSelectFarmer = (farmer: FarmerLocation) => {
    setSelectedFarmer(farmer);
    setSelectedMarket(null);
    setCenter(farmer.coordinates);
    setZoom(14);
  };

  // Center on a market
  const handleSelectMarket = (market: MarketLocation) => {
    setSelectedMarket(market);
    setSelectedFarmer(null);
    setCenter(market.coordinates);
    setZoom(14);
  };

  // Get current browser location
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setCenter(coords);
          setZoom(13);
          setIsProximityActive(true);
        },
        (err) => {
          alert(`Unable to retrieve your location: ${err.message}`);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Vendor / Farmer save new farm coordinates
  const handleSaveFarmLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) {
      setUpdateError('Please login with a Farmer account to update farm location.');
      return;
    }

    setSavingLocation(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const res = await fetch('/api/farmers/me/location', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          latitude: Number(editLat),
          longitude: Number(editLng),
          farmAddress: editAddress.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update farm location.');
      }

      setUpdateSuccess('Farm location coordinates updated on Google Maps!');
      await fetchData();
      setCenter({ lat: Number(editLat), lng: Number(editLng) });
      setZoom(14);
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header & Search Bar */}
      <div className="p-4 md:p-6 border-b border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <MapPin className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Vendor & Farm Google Map</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                Live Google Maps Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Vendors and customers can view farm locations, inspect stalls, check distances to markets, and get turn-by-turn directions.
            </p>
          </div>

          {/* Quick Stats & GPS Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLocateMe}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Use current GPS location"
            >
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Location</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farm name, produce, address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter by Attending Market */}
          <div className="md:col-span-3">
            <select
              value={selectedMarketFilter}
              onChange={(e) => setSelectedMarketFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Farmers Markets</option>
              {markets.map((m) => (
                <option key={m._id} value={m._id}>
                  Market: {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Layer toggles */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-2 text-xs">
            <button
              onClick={() => setShowFarmers(!showFarmers)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition ${
                showFarmers
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Farmers ({filteredFarmers.length})</span>
            </button>

            <button
              onClick={() => setShowMarkets(!showMarkets)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition ${
                showMarkets
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Markets ({markets.length})</span>
            </button>

            <button
              onClick={() => setIsUpdatingLocation(!isUpdatingLocation)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition ${
                isUpdatingLocation
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Set Farm Pin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Vendor Farm Pin Updater Panel */}
      {isUpdatingLocation && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 transition animate-fadeIn">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                Vendor Farm Location Manager
              </h3>
              <span className="text-[11px] text-slate-400">
                {authToken ? 'Authenticated as Farmer' : 'Login as Farmer required'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Set or update your farm's physical coordinates so customers and market coordinators can locate your farm on Google Maps.
            </p>

            <form onSubmit={handleSaveFarmLocation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editLat}
                  onChange={(e) => setEditLat(parseFloat(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editLng}
                  onChange={(e) => setEditLng(parseFloat(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Farm / Gate Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="e.g. 884 Miller Creek Rd"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setEditLat(Math.round(pos.coords.latitude * 10000) / 10000);
                          setEditLng(Math.round(pos.coords.longitude * 10000) / 10000);
                        });
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Copy current GPS to fields
                  </button>
                  {updateSuccess && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {updateSuccess}</span>}
                  {updateError && <span className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {updateError}</span>}
                </div>

                <button
                  type="submit"
                  disabled={savingLocation}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  {savingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Location Coordinates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Map View & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Left Column: Farmers List */}
        <div className="lg:col-span-4 bg-slate-950/60 border-r border-slate-800 p-4 space-y-3 max-h-[580px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Farmers & Stalls ({filteredFarmers.length})
            </span>
            <span className="text-[11px] text-slate-500">Click to locate</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <p className="text-xs">Loading farm locations from MongoDB...</p>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No farms found matching your search criteria.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFarmers.map((farmer) => {
                const isSelected = selectedFarmer?.id === farmer.id;
                return (
                  <div
                    key={farmer.id}
                    onClick={() => handleSelectFarmer(farmer)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <h4 className="font-semibold text-slate-100 text-sm">{farmer.businessName}</h4>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1">{farmer.address}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-medium border border-amber-500/20 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{farmer.ratingAverage.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-[11px] mt-2 line-clamp-2">{farmer.description}</p>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-emerald-400 font-medium">
                        {farmer.productCount} active {farmer.productCount === 1 ? 'product' : 'products'}
                      </span>
                      <a
                        href={farmer.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Markets List Section */}
          {markets.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                Pickup Markets ({markets.length})
              </span>
              <div className="space-y-2">
                {markets.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => handleSelectMarket(m)}
                    className={`p-2.5 rounded-lg border cursor-pointer text-xs transition ${
                      selectedMarket?._id === m._id
                        ? 'bg-amber-950/40 border-amber-500/60'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-slate-200">{m.name}</p>
                    <p className="text-[11px] text-slate-400">{m.address}</p>
                    <p className="text-[10px] text-amber-300/80 mt-1">{m.marketDays.join(', ')} • {m.operatingHours}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Google Maps Interactive Canvas */}
        <div className="lg:col-span-8 relative min-h-[480px]">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={defaultCenter}
              center={center}
              defaultZoom={12}
              zoom={zoom}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              className="w-full h-full min-h-[480px]"
            >
              <MapPanController center={center} zoom={zoom} />

              {/* Farmer Markers */}
              {showFarmers &&
                filteredFarmers.map((farmer) => (
                  <Marker
                    key={farmer.id}
                    position={farmer.coordinates}
                    title={farmer.businessName}
                    onClick={() => setSelectedFarmer(farmer)}
                  />
                ))}

              {/* Market Markers */}
              {showMarkets &&
                markets.map((market) => (
                  <Marker
                    key={market._id}
                    position={market.coordinates}
                    title={market.name}
                    onClick={() => setSelectedMarket(market)}
                  />
                ))}

              {/* Farmer InfoWindow */}
              {selectedFarmer && (
                <InfoWindow
                  position={selectedFarmer.coordinates}
                  onCloseClick={() => setSelectedFarmer(null)}
                >
                  <div className="p-2 max-w-xs text-slate-900 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                      <h4 className="font-bold text-sm text-slate-900">{selectedFarmer.businessName}</h4>
                    </div>

                    <p className="text-xs text-slate-600">{selectedFarmer.address}</p>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        ★ {selectedFarmer.ratingAverage.toFixed(1)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-700 font-medium">
                        {selectedFarmer.productCount} Products in Stock
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-100 p-1.5 rounded">
                      <p className="font-medium text-slate-700">Attends Markets:</p>
                      <p>{selectedFarmer.markets.map((m) => m.name).join(', ') || 'Independent farm pickup'}</p>
                    </div>

                    {selectedFarmer.contactNumber && (
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{selectedFarmer.contactNumber}</span>
                      </p>
                    )}

                    <div className="pt-1">
                      <a
                        href={selectedFarmer.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 text-white font-medium rounded hover:bg-emerald-700 transition"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Get Directions on Google Maps</span>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Market InfoWindow */}
              {selectedMarket && (
                <InfoWindow
                  position={selectedMarket.coordinates}
                  onCloseClick={() => setSelectedMarket(null)}
                >
                  <div className="p-2 max-w-xs text-slate-900 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                      <h4 className="font-bold text-sm text-slate-900">{selectedMarket.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{selectedMarket.address}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      Operating: {selectedMarket.marketDays.join(', ')} ({selectedMarket.operatingHours})
                    </p>
                    <div className="pt-1">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarket.coordinates.lat},${selectedMarket.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>
      </div>
    </div>
  );
}
