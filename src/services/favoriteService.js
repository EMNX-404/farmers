import apiClient from './apiClient';

export const favoriteService = {
  async getFavorites() {
    const res = await apiClient.get('/favorites');
    return res.data;
  },

  async toggleFarmer(farmerId) {
    const res = await apiClient.post('/favorites/farmer', { farmerId });
    return res.data;
  },

  async toggleProduct(productId) {
    const res = await apiClient.post('/favorites/product', { productId });
    return res.data;
  },

  async toggleMarket(marketId) {
    const res = await apiClient.post('/favorites/market', { marketId });
    return res.data;
  },
};

export default favoriteService;
