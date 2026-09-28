import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Sprout,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  X,
  Search,
} from 'lucide-react';
import productService from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { getProductImage } from '../../utils/assets';
import { FadeIn, SlideUp } from '../../Animation';
import { LoadingSkeleton, EmptyState } from '../../components/common/StateViews';

export default function FarmerProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('lb');
  const [stockQuantity, setStockQuantity] = useState('25');
  const [description, setDescription] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productService.getMyProducts(),
        productService.getCategories(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?._id || '');
    setPrice('');
    setUnit('lb');
    setStockQuantity('25');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setCategory(prod.category?._id || prod.category || '');
    setPrice(String(prod.price || ''));
    setUnit(prod.unit || 'lb');
    setStockQuantity(String(prod.stockQuantity || '0'));
    setDescription(prod.description || '');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        category,
        price: parseFloat(price),
        unit,
        stockQuantity: parseInt(stockQuantity, 10),
        description,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        showToast?.('Product updated successfully!', 'success');
      } else {
        await productService.createProduct(payload);
        showToast?.('New produce added to your catalog!', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast?.(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStock = async (prod) => {
    try {
      const newStatus = prod.availabilityStatus === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
      const newQty = newStatus === 'in_stock' ? Math.max(10, prod.stockQuantity || 10) : 0;
      await productService.updateProductStock(prod._id, newQty, newStatus, prod.price);
      setProducts(
        products.map((p) =>
          p._id === prod._id ? { ...p, availabilityStatus: newStatus, stockQuantity: newQty } : p
        )
      );
      showToast?.(`Updated ${prod.name} to ${newStatus === 'in_stock' ? 'In Stock' : 'Sold Out'}`, 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to update stock', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from your farm catalog?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      showToast?.('Product removed from catalog', 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete product', 'error');
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-leaf" style={{ marginBottom: '0.4rem' }}>
              Produce Management
            </span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
              Farm Catalog & Inventory
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Publish weekly harvest quantities for customers to reserve ahead of market day.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={18} /> Add Harvest Produce
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Filter by produce name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            />
          </div>
        </div>

        {/* Catalog Table */}
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : filteredProducts.length === 0 ? (
          <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <Sprout size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-forest)', margin: 0 }}>No produce items found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Add your first crop to open online pre-orders for the upcoming market.
            </p>
            <button onClick={openAddModal} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
              Add Produce Item
            </button>
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', fontWeight: '700' }}>Produce</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', fontWeight: '700' }}>Price</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', fontWeight: '700' }}>Stock Reserved</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', color: 'var(--color-forest)', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const img = getProductImage(prod);
                  const isSoldOut = prod.availabilityStatus === 'out_of_stock' || (prod.stockQuantity || 0) <= 0;

                  return (
                    <tr key={prod._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={img}
                            alt={prod.name}
                            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--color-forest)', display: 'block', fontSize: '0.95rem' }}>
                              {prod.name}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Unit: {prod.unit || 'lb'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {prod.category?.name || 'Produce'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--color-forest)' }}>
                        ${Number(prod.price || 0).toFixed(2)}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: '700', color: (prod.stockQuantity || 0) < 10 ? '#d97706' : 'var(--color-grass)' }}>
                          {prod.stockQuantity || 0}
                        </span>{' '}
                        {prod.unit || 'units'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(prod)}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isSoldOut ? 'var(--color-error-soft)' : 'var(--color-leaf-soft)',
                            color: isSoldOut ? 'var(--color-error)' : 'var(--color-forest)',
                          }}
                        >
                          {isSoldOut ? 'Sold Out' : 'Active In Stock'}
                        </button>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="btn-icon"
                            title="Edit produce"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="btn-icon"
                            title="Delete"
                            style={{ color: 'var(--color-error)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              className="card animate-scale-up"
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-forest)', margin: 0 }}>
                  {editingProduct ? 'Edit Produce Item' : 'Add Produce to Catalog'}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                    Produce Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Crisp Honeycrisp Apples"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                      Category
                    </label>
                    <select
                      required
                      className="input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                      Unit
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g. lb, bunch, pint"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                      Price per Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="input"
                      placeholder="4.50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                      Available Stock
                    </label>
                    <input
                      type="number"
                      required
                      className="input"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                    Harvest Notes & Description
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    placeholder="Tell patrons about variety, flavor profile, and ripeness..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
