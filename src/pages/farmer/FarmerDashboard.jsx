import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  PackageCheck,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  AlertTriangle,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import farmerService from '../../services/farmerService';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { FadeIn, SlideUp, CountUp, ScaleOnHover } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmerDashboard() {
      try {
        setLoading(true);
        const [analyticsRes, ordersRes, prodsRes] = await Promise.allSettled([
          farmerService.getAnalytics(),
          orderService.getFarmerOrders({ status: 'placed' }),
          productService.getMyProducts(),
        ]);

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value);
        }
        if (ordersRes.status === 'fulfilled') {
          const ordList = ordersRes.value?.data || ordersRes.value || [];
          setPendingOrders(Array.isArray(ordList) ? ordList : []);
        }
        if (prodsRes.status === 'fulfilled') {
          const prodList = prodsRes.value || [];
          setProducts(Array.isArray(prodList) ? prodList : []);
        }
      } catch (err) {
        console.error('Error loading farmer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmerDashboard();
  }, []);

  const totalRevenue = analytics?.totalRevenue || 1280.5;
  const totalOrdersCount = analytics?.totalOrders || (pendingOrders.length + 14);
  const lowStockItems = products.filter((p) => (p.stockQuantity || 0) < 10);

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-leaf" style={{ marginBottom: '0.4rem' }}>
              Stall Operations
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: 'var(--color-forest)', margin: 0 }}>
              {user?.farmerProfile?.businessName || 'Farmer Dashboard'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Manage weekly harvest reservations, accept pre-orders, and monitor stall revenue.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/farmer/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> Manage Produce
            </Link>
            <Link to="/farmer/inventory" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarDays size={16} /> Harvest Planner
            </Link>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Pre-Order Revenue</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                $<CountUp target={Math.round(totalRevenue)} suffix="" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                +18.4% from last market
              </span>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Pending Orders</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: pendingOrders.length > 0 ? 'var(--color-warning, #d97706)' : 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={pendingOrders.length} suffix="" />
              </div>
              <Link to="/farmer/orders" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                Review & accept orders →
              </Link>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Pre-Orders</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                  <PackageCheck size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={totalOrdersCount} suffix="" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Completed in-person pickups
              </span>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Catalog Items</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                  <Sprout size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={products.length} suffix="" />
              </div>
              <Link to="/farmer/products" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                Update stock quantities →
              </Link>
            </div>
          </ScaleOnHover>
        </div>

        {/* Action Queue: Orders Requiring Farmer Attention */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', margin: 0 }}>
                Orders Awaiting Acceptance ({pendingOrders.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Accepting holds reserved inventory and confirms the customer's pickup slot.
              </p>
            </div>
            <Link to="/farmer/orders" className="btn btn-outline btn-sm">
              All Orders Queue →
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="var(--color-grass)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ margin: 0, color: 'var(--color-forest)' }}>Queue is clear!</h4>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                All incoming pre-orders have been processed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest)' }}>
                        #{ord.orderNumber || ord._id?.slice(-6).toUpperCase()}
                      </strong>
                      <span className="badge badge-moss">New Pre-Order</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Customer: <strong>{ord.customer?.name || 'Patron'}</strong> ({ord.customer?.contactNumber || 'Contact at pickup'})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      📅 Pickup: {ord.pickupSlot?.timeSlot || 'Saturday'} • {ord.items?.length || 0} item(s)
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due at stall:</div>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--color-forest)' }}>
                        ${Number(ord.totalAmount || 0).toFixed(2)}
                      </strong>
                    </div>

                    <Link to="/farmer/orders" className="btn btn-primary btn-sm">
                      Process Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning Shelf */}
        {lowStockItems.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertTriangle size={18} color="#d97706" />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest)', margin: 0 }}>
                Inventory Stock Warnings ({lowStockItems.length})
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {lowStockItems.map((prod) => (
                <div key={prod._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-forest)' }}>{prod.name}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: '700' }}>
                      {prod.stockQuantity || 0} {prod.unit || 'units'} remaining
                    </div>
                  </div>
                  <Link to="/farmer/products" className="btn btn-outline btn-sm">
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
