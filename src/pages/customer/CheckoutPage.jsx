import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import marketService from '../../services/marketService';
import orderService from '../../services/orderService';
import { FadeIn, SlideUp } from '../../Animation';

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('9:00 AM - 10:30 AM');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const items = cart?.items || [];

  useEffect(() => {
    async function loadMarkets() {
      try {
        const data = await marketService.getMarkets();
        setMarkets(data || []);
        if (data && data.length > 0) {
          setSelectedMarketId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMarkets();

    // Default pickup date to next Saturday
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    setPickupDate(d.toISOString().split('T')[0]);
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/customer/checkout' } } });
      return;
    }
    if (items.length === 0) {
      navigate('/products');
      return;
    }

    setSubmitting(true);
    try {
      // Find the farmer ID from first item or items
      const farmerId =
        items[0]?.product?.farmer?._id ||
        items[0]?.product?.farmer ||
        items[0]?.farmer;

      const orderPayload = {
        market: selectedMarketId,
        farmer: farmerId,
        items: items.map((it) => ({
          product: it.product?._id || it.product,
          quantity: it.quantity,
          price: it.price || it.product?.price || 0,
        })),
        pickupDate,
        pickupSlot: {
          timeSlot: pickupTimeSlot,
        },
        notes: customerNotes,
      };

      const createdOrder = await orderService.createPreOrder(orderPayload);
      await clearCart();
      setOrderSuccess(createdOrder);
      showToast?.('Pre-order reserved successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to place pre-order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container-narrow" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <FadeIn>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-leaf-soft)',
              color: 'var(--color-grass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={44} />
          </div>
          <span className="badge badge-grass" style={{ marginBottom: '0.75rem' }}>
            Reservation Confirmed
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
            Your Harvest is Reserved!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Order <strong>#{orderSuccess.orderNumber || orderSuccess._id?.slice(-6).toUpperCase()}</strong> has been dispatched to the farm stall. The grower will harvest and pack your fresh produce.
          </p>

          <div
            className="card"
            style={{
              maxWidth: '460px',
              margin: '0 auto 2rem',
              padding: '1.5rem',
              textAlign: 'left',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pickup Date:</span>
              <strong>{pickupDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Time Window:</span>
              <strong>{pickupTimeSlot}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: '700', color: 'var(--color-forest)' }}>Amount Due at Stall:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-grass)' }}>
                ${Number(orderSuccess.totalAmount || totalAmount || 0).toFixed(2)}
              </strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              💵 Pay in person at the stall upon inspection (Cash or Card).
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/customer/orders/${orderSuccess._id}`} className="btn btn-primary">
              View Order Progress Timeline
            </Link>
            <Link to="/" className="btn btn-outline">
              Return Home
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-narrow" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-forest)' }}>No items in cart to checkout</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-leaf" style={{ marginBottom: '0.4rem' }}>
            Step 2 of 2
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Confirm Pickup & Reserve
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Choose which farmers market and time window you will visit to pick up your harvest.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left: Pickup Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Market Selection */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Store size={20} color="var(--color-grass)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest)', margin: 0 }}>
                  1. Select Pickup Market
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {markets.map((mkt) => {
                  const isSelected = selectedMarketId === mkt._id;
                  return (
                    <label
                      key={mkt._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-grass)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-leaf-soft)' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="radio"
                          name="market"
                          checked={isSelected}
                          onChange={() => setSelectedMarketId(mkt._id)}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                            {mkt.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            📍 {mkt.address}, {mkt.city} • Open: {mkt.operatingHours || '8am - 1pm'}
                          </div>
                        </div>
                      </div>
                      <span className="badge" style={{ fontSize: '0.72rem' }}>
                        {mkt.marketDays?.join(', ') || 'Sat & Sun'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Slot Selection */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Calendar size={20} color="var(--color-grass)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest)', margin: 0 }}>
                  2. Pickup Date & Time Window
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                    Preferred Pickup Slot
                  </label>
                  <select
                    className="input"
                    value={pickupTimeSlot}
                    onChange={(e) => setPickupTimeSlot(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="8:00 AM - 9:30 AM">8:00 AM - 9:30 AM (Early Harvest)</option>
                    <option value="9:30 AM - 11:00 AM">9:30 AM - 11:00 AM (Peak Market)</option>
                    <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM (Midday)</option>
                    <option value="12:30 PM - 1:30 PM">12:30 PM - 1:30 PM (Market Close)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Note for the Farmer (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Please choose slightly greener bananas, or I'll arrive around 10:15"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>
          </div>

          {/* Right: Order Review & Complete Reservation */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-forest)', marginBottom: '1.25rem' }}>
              Reservation Confirmation
            </h3>

            {/* In-Person Payment Guarantee Callout */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                border: '1.5px dashed var(--color-grass)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="var(--color-grass)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-forest)', display: 'block', fontSize: '0.92rem' }}>
                    Payment at Pickup Policy:
                  </strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    You pay zero dollars online today. Your items are guaranteed and packed for you at the vendor stall. Pay the farmer directly with Cash, Debit, or Credit upon pickup.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Item List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {it.quantity}x {it.product?.name || 'Produce'}
                  </span>
                  <strong>${(Number(it.price || it.product?.price || 0) * it.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                Total Due at Market:
              </span>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                ${Number(totalAmount || 0).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.75rem',
              }}
            >
              <CheckCircle2 size={18} />
              {submitting ? 'Placing Pre-Order...' : 'Confirm Pre-Order Reservation'}
            </button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
