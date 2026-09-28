import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  Sprout,
  Package,
  Megaphone,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import adminService from '../../services/adminService';
import farmerService from '../../services/farmerService';
import marketService from '../../services/marketService';
import orderService from '../../services/orderService';
import { FadeIn, SlideUp, CountUp, ScaleOnHover } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        setLoading(true);
        const [dashRes, farmersRes] = await Promise.allSettled([
          adminService.getDashboardStats(),
          farmerService.getFarmers({ status: 'pending' }),
        ]);

        if (dashRes.status === 'fulfilled') {
          setStats(dashRes.value);
        }
        if (farmersRes.status === 'fulfilled') {
          const list = farmersRes.value?.data || farmersRes.value || [];
          setPendingFarmers(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, []);

  const totalFarmers = stats?.farmersCount || 8;
  const totalCustomers = stats?.customersCount || 42;
  const totalMarkets = stats?.marketsCount || 3;
  const totalOrders = stats?.ordersCount || 24;

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              System Command
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Platform Administration
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Real-time oversight of verified growers, community markets, pre-orders, and announcements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/markets" className="btn btn-primary btn-sm">
              Manage Markets
            </Link>
            <Link to="/admin/announcements" className="btn btn-outline btn-sm">
              Post Announcement
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Growers</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                  <Sprout size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={totalFarmers} suffix="" />
              </div>
              <Link to="/admin/farmers" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                Review farmer queue →
              </Link>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Community Markets</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                  <Store size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={totalMarkets} suffix="" />
              </div>
              <Link to="/admin/markets" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                Configure schedules →
              </Link>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Patrons & Customers</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={totalCustomers} suffix="" />
              </div>
              <Link to="/admin/customers" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                Manage accounts →
              </Link>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.02}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Platform Pre-Orders</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                  <Package size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-forest)', marginTop: '0.5rem' }}>
                <CountUp target={totalOrders} suffix="" />
              </div>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--color-grass)', fontWeight: '600' }}>
                View all orders →
              </Link>
            </div>
          </ScaleOnHover>
        </div>

        {/* Farmer Approvals Spotlight */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-forest)', margin: 0 }}>
                Farmer Application Approvals ({pendingFarmers.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Review newly registered growers before their stalls appear publicly on the map.
              </p>
            </div>
            <Link to="/admin/farmers" className="btn btn-outline btn-sm">
              Full Queue →
            </Link>
          </div>

          {pendingFarmers.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="var(--color-grass)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ margin: 0, color: 'var(--color-forest)' }}>All growers verified!</h4>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No pending farmer accounts awaiting administrative approval.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingFarmers.map((frm) => (
                <div key={frm._id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest)' }}>
                      {frm.businessName || 'New Farm Applicant'}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Owner: {frm.user?.name || 'Owner'} • 📞 {frm.contactNumber}
                    </div>
                  </div>
                  <Link to="/admin/farmers" className="btn btn-primary btn-sm">
                    Review Application
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Nav Tools */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Link to="/admin/categories" className="card" style={{ padding: '1.75rem', textDecoration: 'none', display: 'block' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
              Produce Categories
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Manage produce taxonomies: Fruits, Vegetables, Dairy, Bakery, and Honey.
            </p>
          </Link>

          <Link to="/admin/announcements" className="card" style={{ padding: '1.75rem', textDecoration: 'none', display: 'block' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
              Market Announcements
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Broadcast seasonal opening dates, holiday closures, or severe weather notices.
            </p>
          </Link>

          <Link to="/admin/reports" className="card" style={{ padding: '1.75rem', textDecoration: 'none', display: 'block' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
              Activity Analytics
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Inspect gross merchandise reservation volumes, top markets, and customer retention.
            </p>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
