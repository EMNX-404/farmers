import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isCustomer } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || !isCustomer) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      showToast('Please sign in as a customer to add items to your cart', 'info');
      return false;
    }
    if (!isCustomer) {
      showToast('Only customer accounts can place pre-orders', 'warning');
      return false;
    }

    try {
      await cartService.addToCart(productId, quantity);
      await fetchCart();
      showToast('Item added to pre-order cart', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await cartService.updateQuantity(productId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
      showToast('Item removed from cart', 'info');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const value = {
    cart,
    items: cart?.items || [],
    itemCount: cart?.itemCount || 0,
    subtotal: cart?.subtotal || 0,
    total: cart?.total || 0,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
