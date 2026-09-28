import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit, Sprout } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { FadeIn } from '../../Animation';
import { LoadingSkeleton } from '../../components/common/StateViews';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await adminService.createCategory({ name: name.trim(), description: description.trim() });
      setCategories([...categories, created]);
      setName('');
      setDescription('');
      showToast?.('Category created!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to create category', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this produce category?')) return;
    try {
      await adminService.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      showToast?.('Category deleted', 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <FadeIn>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.4rem' }}>
            Produce Taxonomy
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest)', margin: 0 }}>
            Market Categories
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Structure produce classification across customer filters and grower inventory batches.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Create Box */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '1.25rem' }}>
              Add Produce Category
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Category Title
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Microgreens & Mushrooms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                  Description / Produce Examples
                </label>
                <textarea
                  rows={3}
                  className="input"
                  placeholder="Fresh culinary mushrooms, sprouting trays, pea shoots..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="btn btn-primary"
                style={{ width: 'fit-content', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
              >
                <Plus size={16} />
                {creating ? 'Adding...' : 'Create Category'}
              </button>
            </form>
          </div>

          {/* List of Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : categories.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Layers size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ color: 'var(--color-forest)' }}>No categories configured</h4>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat._id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest)' }}>
                      {cat.name}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {cat.description || 'Produce collection'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat._id)}
                    className="btn-icon"
                    title="Delete category"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
