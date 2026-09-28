import React, { useState, useEffect } from 'react';
import { CalendarDays, Save, Plus, AlertCircle, CheckCircle2, Sprout } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { FadeIn, SlideUp } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function FarmerInventoryPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marketDay, setMarketDay] = useState('Saturday');
  const [inventoryMap, setInventoryMap] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const prods = await productService.getMyProducts();
        const list = Array.isArray(prods) ? prods : [];
        setProducts(list);

        const initialMap = {};
        list.forEach((p) => {
          initialMap[p._id] = {
            quantity: p.stockQuantity || 20,
            price: p.price || 4.5,
            isAvailable: p.availabilityStatus !== 'out_of_stock',
          };
        });
        setInventoryMap(initialMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFieldChange = (productId, field, value) => {
    setInventoryMap((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSaveBatch = async () => {
    setSaving(true);
    try {
      // Save updated stock per product
      for (const prod of products) {
        const item = inventoryMap[prod._id];
        if (item) {
          await productService.updateProductStock(
            prod._id,
            parseInt(item.quantity, 10),
            item.isAvailable ? 'in_stock' : 'out_of_stock',
            parseFloat(item.price)
          );
        }
      }
      showToast?.(`Weekly inventory for ${marketDay} market saved!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to save inventory batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
              Crop Allocation
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Weekly Harvest Planner
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Configure expected harvest yields and opening inventory for the upcoming market.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              className="input"
              value={marketDay}
              onChange={(e) => setMarketDay(e.target.value)}
              style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            >
              <option value="Saturday">Saturday Downtown Market</option>
              <option value="Sunday">Sunday Central Market</option>
              <option value="Wednesday">Wednesday Midweek Green</option>
            </select>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveBatch}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {saving ? 'Publishing...' : 'Publish Weekly Stock'}
            </button>
          </div>
        </div>

        {/* Informative Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-leaf-soft)',
            border: '1px solid rgba(236,243,158,0.8)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: 'var(--color-forest)',
          }}
        >
          💡 <strong>Harvest Cycle Best Practice:</strong> Farmers update their batch availability every Thursday afternoon. Customers who pre-order will have quantities deducted from this harvest allocation.
        </div>

        {/* Table of Harvest Quantities */}
        {loading ? (
          <LoadingSkeleton type="card" count={2} />
        ) : products.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Sprout size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: 'var(--color-forest)' }}>No produce catalog items found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Add produce items first before configuring weekly harvest batches.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Crop Name</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Harvest Units</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Allocated Stock</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Market Price ($)</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)' }}>Pre-Orders Open?</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const item = inventoryMap[prod._id] || { quantity: 20, price: prod.price || 4, isAvailable: true };

                  return (
                    <tr key={prod._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                        {prod.name}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                        {prod.unit || 'lb'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input
                          type="number"
                          min={0}
                          className="input"
                          value={item.quantity}
                          onChange={(e) => handleFieldChange(prod._id, 'quantity', e.target.value)}
                          style={{ width: '90px', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                        />
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={item.price}
                          onChange={(e) => handleFieldChange(prod._id, 'price', e.target.value)}
                          style={{ width: '90px', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                        />
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={(e) => handleFieldChange(prod._id, 'isAvailable', e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-grass)' }}
                        />
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: item.isAvailable ? 'var(--color-grass)' : 'var(--text-muted)' }}>
                          {item.isAvailable ? 'Accepting Orders' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
