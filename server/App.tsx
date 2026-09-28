import React, { useState, useEffect } from 'react';
import {
  Server,
  Key,
  ShieldCheck,
  Bot,
  Layers,
  ShoppingBag,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Send,
  Loader2,
  LogOut,
  UserCheck,
  Compass,
} from 'lucide-react';
import FarmersMap from './components/FarmersMap.tsx';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  role: 'Public' | 'Customer' | 'Farmer' | 'Admin' | 'Auth';
  desc: string;
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  'Google Maps & Locations': [
    { method: 'GET', path: '/api/maps/config', role: 'Public', desc: 'Get Google Maps API configuration & region center' },
    { method: 'GET', path: '/api/maps/farmers', role: 'Public', desc: 'Fetch all approved farmers with GPS coordinates & directions' },
    { method: 'GET', path: '/api/maps/nearby?lat=..&lng=..', role: 'Public', desc: 'Geospatial 2dsphere proximity search (farmers & markets)' },
    { method: 'PATCH', path: '/api/farmers/me/location', role: 'Farmer', desc: 'Update farm pin coordinates [longitude, latitude] & address' },
    { method: 'GET', path: '/api/farmers/locations', role: 'Public', desc: 'Direct alias for vendor farm coordinates' },
  ],
  'Auth & Users': [
    { method: 'POST', path: '/api/auth/register-customer', role: 'Public', desc: 'Register customer account' },
    { method: 'POST', path: '/api/auth/register-farmer', role: 'Public', desc: 'Register farmer account (pending approval)' },
    { method: 'POST', path: '/api/auth/login', role: 'Public', desc: 'User login & JWT generation' },
    { method: 'GET', path: '/api/auth/me', role: 'Auth', desc: 'Current user profile & farmer profile' },
    { method: 'PUT', path: '/api/auth/profile', role: 'Auth', desc: 'Update profile details' },
    { method: 'PUT', path: '/api/auth/password', role: 'Auth', desc: 'Change password' },
    { method: 'GET', path: '/api/users', role: 'Admin', desc: 'Search & filter user accounts' },
  ],
  'Markets & Stalls': [
    { method: 'GET', path: '/api/markets', role: 'Public', desc: 'Browse active markets by day & location' },
    { method: 'GET', path: '/api/markets/:id', role: 'Public', desc: 'Market details with attending farmers' },
    { method: 'POST', path: '/api/markets', role: 'Admin', desc: 'Create market' },
    { method: 'POST', path: '/api/markets/:id/associate', role: 'Farmer', desc: 'Join or leave a market' },
  ],
  'Farmers & Catalog': [
    { method: 'GET', path: '/api/farmers', role: 'Public', desc: 'List approved farmers & stalls' },
    { method: 'GET', path: '/api/farmers/:id', role: 'Public', desc: 'Public farmer profile with products & reviews' },
    { method: 'GET', path: '/api/farmers/analytics', role: 'Farmer', desc: 'Farmer revenue, orders & best sellers' },
    { method: 'GET', path: '/api/products', role: 'Public', desc: 'Search/filter products (category, market, day, price)' },
    { method: 'POST', path: '/api/products', role: 'Farmer', desc: 'Add new product to catalog' },
    { method: 'PATCH', path: '/api/products/:id/stock', role: 'Farmer', desc: 'Update inventory stock & status' },
  ],
  'Pre-Orders & Cart': [
    { method: 'GET', path: '/api/cart', role: 'Customer', desc: 'Customer cart with verified backend prices' },
    { method: 'POST', path: '/api/cart/add', role: 'Customer', desc: 'Add to cart (stock verified on backend)' },
    { method: 'POST', path: '/api/orders', role: 'Customer', desc: 'Place pre-order for in-person cash pickup' },
    { method: 'GET', path: '/api/orders/customer', role: 'Customer', desc: 'Customer pre-order history' },
    { method: 'GET', path: '/api/orders/farmer', role: 'Farmer', desc: 'Incoming orders queue' },
    { method: 'PATCH', path: '/api/orders/:id/status', role: 'Farmer', desc: 'Progress lifecycle: accepted, ready, completed, declined' },
  ],
  'AI Assistant': [
    { method: 'POST', path: '/api/ai/chat', role: 'Public', desc: 'MarketLink Gemini assistant with DB context' },
  ],
};

const SEED_ACCOUNTS = [
  { role: 'Farmer', email: 'farmer.bob@marketlink.local', pass: 'MarketLink2026!', note: 'Green Valley Organic Farm (Bob Miller)' },
  { role: 'Farmer', email: 'farmer.alice@marketlink.local', pass: 'MarketLink2026!', note: 'Sunrise Orchards & Apiary (Alice Green)' },
  { role: 'Customer', email: 'customer.emma@marketlink.local', pass: 'MarketLink2026!', note: 'Emma Watson (Active pre-orders)' },
  { role: 'Admin', email: 'admin@marketlink.local', pass: 'MarketLink2026!', note: 'Super Admin Access' },
];

export default function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('AIzaSyAR7A1khhFmYm88HLvLzpD3ly6ql9M3nbs');
  const [aiQuestion, setAiQuestion] = useState('Where are Green Valley Organic Farm and Sunrise Orchards located?');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Authenticated user state for quick testing
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch health status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline', version: '1.0.0' }));

    // 2. Fetch Google Maps configuration
    fetch('/api/maps/config')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.apiKey) {
          setMapApiKey(res.data.apiKey);
        }
      })
      .catch(console.error);

    // Auto-login as Farmer Bob initially for seamless location demo
    handleQuickLogin('farmer.bob@marketlink.local', 'MarketLink2026!');
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    setLoginLoading(email);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
        setCurrentUser(data.data.user);
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setLoginLoading(null);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  const handleSendAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiQuestion }),
      });
      const data = await res.json();
      setAiResponse(data.message || 'No response message');
    } catch (err: any) {
      setAiResponse(`Error connecting to AI endpoint: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  MarketLink Backend & Google Maps
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Live Platform
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Complete Node.js, Express, MongoDB, Google Maps & Gemini AI backend for local farmers-market pre-orders.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Authenticated user pill */}
            {currentUser && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-semibold text-slate-200">{currentUser.name}</span>
                  <span className="text-slate-500 text-[10px] ml-1.5 uppercase font-bold px-1.5 py-0.5 bg-slate-800 rounded">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-slate-400 hover:text-rose-400 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <p className="font-semibold text-slate-200">
                  DB: {healthStatus?.database?.databaseName || 'marketlink'} ({healthStatus?.database?.status || 'connected'})
                </p>
                <p className="text-slate-400">Version {healthStatus?.version || '1.0.0'} • Port 3000</p>
              </div>
            </div>
          </div>
        </header>

        {/* Feature Notification Banner */}
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 flex items-start gap-3.5 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-300">Google Maps Features Active: </span>
            Vendors, farmers, and customers can view real farm coordinates on Google Maps, check distances to pickup markets, calculate turn-by-turn directions, and update farm stall coordinates with live MongoDB 2dsphere indexing.
          </div>
        </div>

        {/* FEATURE: Google Maps Interactive Component */}
        <section className="space-y-3">
          <FarmersMap
            apiKey={mapApiKey}
            authToken={authToken}
            currentUser={currentUser}
          />
        </section>

        {/* Grid: Test Accounts & AI Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Seed Accounts with 1-Click Login */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Seed Test Accounts
              </h2>
              <span className="text-xs text-slate-500">Click to switch user</span>
            </div>
            <p className="text-xs text-slate-400">
              Click any account below to authenticate and test role-specific endpoints (e.g. updating farm coordinates as a farmer):
            </p>

            <div className="space-y-2.5">
              {SEED_ACCOUNTS.map((acc) => {
                const isActive = currentUser?.email === acc.email;
                return (
                  <div
                    key={acc.email}
                    className={`p-3 rounded-xl text-xs flex items-center justify-between transition ${
                      isActive
                        ? 'bg-emerald-950/40 border border-emerald-500/50'
                        : 'bg-slate-950/70 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            acc.role === 'Admin'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : acc.role === 'Farmer'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {acc.role}
                        </span>
                        <span className="font-mono text-slate-200">{acc.email}</span>
                        {isActive && <span className="text-[10px] text-emerald-400 font-bold">Active</span>}
                      </div>
                      <p className="text-slate-500 text-[11px]">{acc.note}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickLogin(acc.email, acc.pass)}
                        disabled={loginLoading === acc.email || isActive}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium border border-slate-700 transition disabled:opacity-40"
                      >
                        {loginLoading === acc.email ? 'Logging in...' : isActive ? 'Logged In' : 'Sign In'}
                      </button>
                      <button
                        onClick={() => handleCopy(`${acc.email} / ${acc.pass}`)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Copy credentials"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {copiedText && (
              <p className="text-xs text-emerald-400 text-center font-medium animate-fade">Copied to clipboard!</p>
            )}
          </div>

          {/* AI Assistant Chat Tester */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  Test AI Assistant (<code className="text-xs text-emerald-300 font-mono">POST /api/ai/chat</code>)
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grounded in MongoDB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Queries are retrieved from the database (markets, farmers, locations, products) and synthesized with Gemini 3.8 Flash.
              </p>
            </div>

            {/* Response area */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 min-h-[140px] max-h-[200px] overflow-y-auto text-xs font-mono leading-relaxed text-slate-300">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  Retrieving farm coordinates and catalog context from MongoDB...
                </div>
              ) : aiResponse ? (
                <div className="whitespace-pre-wrap">{aiResponse}</div>
              ) : (
                <span className="text-slate-500 italic">
                  Ask questions like: "Where is Green Valley Organic Farm located?", "Which markets are open Saturday?", or "What honey products are in stock?".
                </span>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendAi} className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask about farm locations, markets, products, pickup times..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send
              </button>
            </form>
          </div>
        </div>

        {/* REST API Explorer / Reference Table */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                REST API Endpoint Registry
              </h2>
              <p className="text-xs text-slate-400">
                All endpoints accept standard JSON payloads and support CORS for frontend integrations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Total Groups: {Object.keys(ENDPOINTS).length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(ENDPOINTS).map(([group, endpoints]) => (
              <div key={group} className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {group}
                </h3>
                <div className="space-y-2">
                  {endpoints.map((ep) => (
                    <div
                      key={ep.method + ep.path}
                      className="p-2.5 bg-slate-900/90 border border-slate-800/60 rounded-lg text-xs flex flex-col gap-1 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ep.method === 'GET'
                                ? 'bg-blue-500/20 text-blue-300'
                                : ep.method === 'POST'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : ep.method === 'PUT' || ep.method === 'PATCH'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {ep.method}
                          </span>
                          <span className="text-slate-200 font-semibold">{ep.path}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {ep.role}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{ep.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
          MarketLink Backend Engine • REST API v1.0.0 • Google Maps Platform Integration • In-Person Cash Pickup Pre-Orders
        </footer>
      </div>
    </div>
  );
}
