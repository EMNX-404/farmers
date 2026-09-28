import apiClient from './apiClient';

export const cartService = {
  async getCart() {
    const res = await apiClient.get('/cart');
    return res.data;
  },

  async addToCart(productId, quantity = 1) {
    const res = await apiClient.post('/cart/add', { productId, quantity });
    return res.data;
  },

  async updateQuantity(productId, quantity) {
    const res = await apiClient.put('/cart/update', { productId, quantity });
    return res.data;
  },

  async removeItem(productId) {
    const res = await apiClient.delete(`/cart/item/${productId}`);
    return res.data;
  },

  async clearCart() {
    return apiClient.delete('/cart/clear');
  },
};

export default cartService;
