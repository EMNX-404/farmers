import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Heart,
  Store,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import favoriteService from '../../services/favoriteService';
import notificationService from '../../services/notificationService';
import marketService from '../../services/marketService';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { FadeIn, SlideUp, CountUp, ScaleOnHover } from '../../Animation';
import { ASSETS } from '../../utils/assets';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState({ products: [], farmers: [], markets: [] });
  const [unreadCount, setUnreadCount] = useState(0);
  const [nearbyMarkets, setNearbyMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [ordersRes, favsRes, notifsRes, marketsRes] = await Promise.allSettled([
          orderService.getCustomerOrders({ limit: 5 }),
          favoriteService.getFavorites(),
          notificationService.getNotifications({ unreadOnly: true }),
          marketService.getMarkets({ limit: 3 }),
        ]);

        if (ordersRes.status === 'fulfilled') {
          const list = ordersRes.value?.data || ordersRes.value || [];
          setOrders(Array.isArray(list) ? list : []);
        }
        if (favsRes.status === 'fulfilled') {
          setFavorites(favsRes.value || { products: [], farmers: [], markets: [] });
        }
        if (notifsRes.status === 'fulfilled') {
          const notifs = notifsRes.value?.data || notifsRes.value || [];
          setUnreadCount(Array.isArray(notifs) ? notifs.length : 0);
        }
        if (marketsRes.status === 'fulfilled') {
          const mkts = marketsRes.value || [];
          setNearbyMarkets(Array.isArray(mkts) ? mkts.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Error loading customer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const activeOrders = orders.filter((o) => ['placed', 'accepted', 'ready'].includes(o.status));
  const latestActiveOrder = activeOrders[0] || null;

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header Greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Customer Portal
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: 'var(--color-forest)', margin: 0 }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Friend'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '1rem' }}>
              Here is your active harvest pre-orders and weekend pickup schedule.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={16} /> Browse Harvest
            </Link>
            <Link to="/customer/cart" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              View Pre-Order Cart
            </Link>
          </div>
        </div>

        {/* Top 3 Summary Metric Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Pre-Orders</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={activeOrders.length} suffix="" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activeOrders.length === 0 ? 'No orders awaiting pickup' : 'Reserved for market pickup'}
              </span>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Saved Favorites</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                  <Heart size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={(favorites.products?.length || 0) + (favorites.farmers?.length || 0)} suffix="" />
              </div>
              <Link to="/customer/favorites" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                View saved stalls & crops →
              </Link>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Unread Alerts</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={unreadCount} suffix="" />
              </div>
              <Link to="/customer/notifications" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                Check harvest updates →
              </Link>
            </div>
          </ScaleOnHover>
        </div>

        {/* Next Upcoming Pickup Spotlight */}
        {latestActiveOrder ? (
          <div
            className="card"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--color-forest)',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '3rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'var(--color-leaf)', color: 'var(--color-forest)', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Next Upcoming Pickup
                </span>
                <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: '0.25rem 0' }}>
                  Order #{latestActiveOrder.orderNumber || latestActiveOrder._id?.slice(-6).toUpperCase()}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem', color: 'rgba(250,249,246,0.9)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Store size={16} color="var(--color-leaf)" />
                    <span>{latestActiveOrder.market?.name || 'Local Farmers Market'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="var(--color-leaf)" />
                    <span>{latestActiveOrder.pickupSlot?.timeSlot || latestActiveOrder.pickupDate ? new Date(latestActiveOrder.pickupDate).toLocaleDateString() : 'This Saturday Morning'}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-leaf)' }}>Amount Due at Stall:</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
                  ${Number(latestActiveOrder.totalAmount || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(250,249,246,0.8)' }}>💵 In-person cash/card</span>
              </div>
            </div>

            {/* Timeline embedded inside dark card */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1.5rem' }}>
              <OrderTimeline status={latestActiveOrder.status} dates={latestActiveOrder} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Link to={`/customer/orders/${latestActiveOrder._id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                View Full Pickup Pass & Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : null}

        {/* 2 Column Layout: Recent Orders & Nearby Markets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {/* Recent Pre-Orders Queue */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-forest)', margin: 0 }}>
                Recent Pre-Orders
              </h2>
              <Link to="/customer/orders" style={{ fontSize: '0.85rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                All Orders ({orders.length}) →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <Package size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: 'var(--color-forest)', margin: 0 }}>No orders yet</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Pick your favorite local apples, sourdough, or heirloom vegetables.
                </p>
                <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  Explore Produce
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((ord) => (
                  <div key={ord._id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                          #{ord.orderNumber || ord._id?.slice(-6).toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            textTransform: 'uppercase',
                            backgroundColor:
                              ord.status === 'completed'
                                ? 'var(--color-leaf-soft)'
                                : ord.status === 'ready'
                                ? '#dbeafe'
                                : 'var(--color-moss-soft)',
                            color:
                              ord.status === 'completed'
                                ? 'var(--color-forest)'
                                : ord.status === 'ready'
                                ? '#1e40af'
                                : 'var(--color-grass)',
                          }}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {ord.items?.length || 1} item(s) • ${Number(ord.totalAmount || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <Link to={`/customer/orders/${ord._id}`} className="btn btn-outline btn-sm">
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Markets Quick Discover */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-forest)', margin: 0 }}>
                Markets This Week
              </h2>
              <Link to="/markets" style={{ fontSize: '0.85rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                All Markets →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {nearbyMarkets.map((mkt) => (
                <div key={mkt._id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={mkt.imageUrl || ASSETS.stalls[0]}
                    alt={mkt.name}
                    style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-forest)' }}>{mkt.name}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      📍 {mkt.city || 'Springfield'}, {mkt.state || 'OR'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-grass)', fontWeight: '600', marginTop: '0.1rem' }}>
                      📅 {mkt.marketDays?.join(', ') || 'Saturdays'}
                    </div>
                  </div>
                  <Link to={`/markets/${mkt._id}`} className="btn btn-outline btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
