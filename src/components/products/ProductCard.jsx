import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { getProductImage } from '../../utils/assets';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import favoriteService from '../../services/favoriteService';
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ product, index = 0, isFav = false, onToggleFav }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorite, setFavorite] = useState(isFav);
  const [adding, setAdding] = useState(false);

  const imgSrc = getProductImage(product, index);
  const isAvailable = product?.availabilityStatus === 'available' && (product?.stockQuantity || 0) > 0;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save your favorite products', 'info');
      return;
    }
    try {
      setFavorite(!favorite);
      await favoriteService.toggleProduct(product._id);
      showToast(favorite ? 'Removed from favorites' : 'Saved to favorites', 'success');
      if (onToggleFav) onToggleFav(product._id, !favorite);
    } catch (err) {
      setFavorite(favorite);
      showToast(err.message, 'error');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable || adding) return;

    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  return (
    <div
      className="card card-hover animate-fade"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* Product Image & Badges */}
      <Link
        to={`/products/${product._id}`}
        style={{
          position: 'relative',
          display: 'block',
          height: '210px',
          overflow: 'hidden',
          backgroundColor: '#f5f4ef',
        }}
      >
        <img
          src={imgSrc}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title={favorite ? 'Remove favorite' : 'Add to favorites'}
        >
          <Heart
            size={18}
            color={favorite ? 'var(--color-error)' : 'var(--text-muted)'}
            fill={favorite ? 'var(--color-error)' : 'transparent'}
          />
        </button>

        {/* Status Badge */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
          {isAvailable ? (
            <span className="badge badge-leaf" style={{ fontSize: '0.7rem' }}>
              Fresh Stock ({product.stockQuantity} {product.unit})
            </span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Body Info */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-moss)' }}>
            {product.category?.name || 'Local Farm Produce'}
          </span>
          {product.ratingAverage > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              <Star size={12} fill="#e67e22" color="#e67e22" />
              <span>{product.ratingAverage.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: '1.3',
              margin: '2px 0',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {product.farmer && (
          <Link
            to={`/farmers/${product.farmer._id || product.farmer}`}
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            By <span style={{ fontWeight: '600', color: 'var(--color-forest)' }}>{product.farmer.businessName || 'Local Grower'}</span>
          </Link>
        )}

        {/* Price and Cart Action */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-grass)' }}>
              ${product.price?.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / {product.unit}</span>
          </div>

          <button
            type="button"
            disabled={!isAvailable || adding}
            onClick={handleAddToCart}
            className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-md)',
              opacity: isAvailable ? 1 : 0.5,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
            }}
          >
            <ShoppingBag size={14} />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
