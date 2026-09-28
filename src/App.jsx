import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useOutletContext, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { MarketLinkAIAssistant } from './components/ai/MarketLinkAI';
import { ErrorState } from './components/common/StateViews';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import MarketsPage from './pages/public/MarketsPage';
import MarketDetailPage from './pages/public/MarketDetailPage';
import FarmersPage from './pages/public/FarmersPage';
import FarmerDetailPage from './pages/public/FarmerDetailPage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import MapPage from './pages/public/MapPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Portal Pages & Layout
import CustomerLayout from './components/layout/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerOrderDetailPage from './pages/customer/CustomerOrderDetailPage';
import FavoritesPage from './pages/customer/FavoritesPage';
import NotificationsPage from './pages/customer/NotificationsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Farmer Portal Pages & Layout
import FarmerLayout from './components/layout/FarmerLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProductsPage from './pages/farmer/FarmerProductsPage';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import FarmerInventoryPage from './pages/farmer/FarmerInventoryPage';
import FarmerPickupSlotsPage from './pages/farmer/FarmerPickupSlotsPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';
import FarmerReviewsPage from './pages/farmer/FarmerReviewsPage';

// Admin Portal Pages & Layout
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFarmersPage from './pages/admin/AdminFarmersPage';
import AdminMarketsPage from './pages/admin/AdminMarketsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function PublicLayout() {
  const [aiOpen, setAiOpen] = useState(false);
  const openAI = () => setAiOpen(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-white)',
      }}
    >
      <Navbar onOpenAI={openAI} />
      <main style={{ flex: 1, width: '100%' }}>
        <Outlet context={{ onOpenAI: openAI }} />
      </main>
      <Footer />
      <MarketLinkAIAssistant isOpen={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}

function LandingRoute() {
  const { onOpenAI } = useOutletContext();
  return <LandingPage onOpenAI={onOpenAI} />;
}

function UnmatchedRoute() {
  return (
    <div className="container-wide" style={{ padding: '4rem 1.5rem' }}>
      <ErrorState
        title="Page not found"
        message="The requested MarketLink route could not be found. Use Markets, Farmers, or Products to continue exploring."
      />
      <div style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '3rem' }}>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Discovery & Auth Routes */}
              <Route element={<PublicLayout />}>
                <Route index element={<LandingRoute />} />
                <Route path="markets" element={<MarketsPage />} />
                <Route path="markets/:id" element={<MarketDetailPage />} />
                <Route path="farmers" element={<FarmersPage />} />
                <Route path="farmers/:id" element={<FarmerDetailPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Customer Portal */}
              <Route path="customer" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<CustomerOrdersPage />} />
                <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<CustomerProfilePage />} />
              </Route>

              {/* Farmer Portal */}
              <Route path="farmer" element={<FarmerLayout />}>
                <Route index element={<FarmerDashboard />} />
                <Route path="dashboard" element={<FarmerDashboard />} />
                <Route path="products" element={<FarmerProductsPage />} />
                <Route path="orders" element={<FarmerOrdersPage />} />
                <Route path="inventory" element={<FarmerInventoryPage />} />
                <Route path="pickup-slots" element={<FarmerPickupSlotsPage />} />
                <Route path="profile" element={<FarmerProfilePage />} />
                <Route path="reviews" element={<FarmerReviewsPage />} />
              </Route>

              {/* Admin Portal */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="farmers" element={<AdminFarmersPage />} />
                <Route path="markets" element={<AdminMarketsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
              </Route>

              {/* Fallback */}
              <Route element={<PublicLayout />}>
                <Route path="*" element={<UnmatchedRoute />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
