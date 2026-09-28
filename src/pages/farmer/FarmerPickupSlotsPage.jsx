import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import orderService from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function FarmerPickupSlotsPage() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState([
    { id: '1', timeSlot: '8:00 AM - 9:30 AM', capacity: 15, currentBookings: 8, isActive: true },
    { id: '2', timeSlot: '9:30 AM - 11:00 AM', capacity: 20, currentBookings: 14, isActive: true },
    { id: '3', timeSlot: '11:00 AM - 12:30 PM', capacity: 15, currentBookings: 5, isActive: true },
    { id: '4', timeSlot: '12:30 PM - 1:30 PM', capacity: 10, currentBookings: 2, isActive: true },
  ]);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newCapacity, setNewCapacity] = useState('15');
  const [loading, setLoading] = useState(false);

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newTimeSlot) return;
    const newSlot = {
      id: Date.now().toString(),
      timeSlot: newTimeSlot,
      capacity: parseInt(newCapacity, 10),
      currentBookings: 0,
      isActive: true,
    };
    setSlots([...slots, newSlot]);
    setNewTimeSlot('');
    showToast?.('Pickup slot added!', 'success');
  };

  const handleToggleSlot = (id) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
    showToast?.('Slot status updated', 'info');
  };

  const handleDeleteSlot = (id) => {
    setSlots(slots.filter((s) => s.id !== id));
    showToast?.('Slot deleted', 'info');
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Pickup Windows
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Market Pickup Time Slots
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Prevent long customer queues by spreading pre-order pickups into scheduled time windows.
            </p>
          </div>
        </div>

        {/* Create slot bar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest)', marginBottom: '1rem' }}>
            Add Pickup Time Window
          </h3>

          <form onSubmit={handleAddSlot} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Time Window Name / Hours
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. 7:30 AM - 8:30 AM (Early Birds)"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                Max Capacity
              </label>
              <input
                type="number"
                required
                className="input"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> Add Slot
            </button>
          </form>
        </div>

        {/* Slots Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="card"
              style={{
                padding: '1.5rem',
                border: slot.isActive ? '1px solid var(--color-border)' : '1px dashed #cbd5e1',
                opacity: slot.isActive ? 1 : 0.65,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--color-grass)" />
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest)' }}>
                    {slot.timeSlot}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="btn-icon"
                  style={{ color: 'var(--color-error)' }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>Reserved Patrons:</span>
                <strong>{slot.currentBookings} / {slot.capacity} orders</strong>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden', marginBottom: '1rem' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (slot.currentBookings / slot.capacity) * 100)}%`,
                    backgroundColor: (slot.currentBookings / slot.capacity) > 0.8 ? '#d97706' : 'var(--color-grass)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleToggleSlot(slot.id)}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: slot.isActive ? 'var(--color-leaf-soft)' : '#f1f5f9',
                    color: slot.isActive ? 'var(--color-forest)' : '#64748b',
                  }}
                >
                  {slot.isActive ? 'Slot Active' : 'Slot Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
