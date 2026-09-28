import apiClient from './apiClient';

export const marketService = {
  async getMarkets(params = {}) {
    const res = await apiClient.get('/markets', params);
    return res.data;
  },

  async getMarketById(id) {
    const res = await apiClient.get(`/markets/${id}`);
    return res.data;
  },

  async createMarket(payload) {
    const res = await apiClient.post('/markets', payload);
    return res.data;
  },

  async updateMarket(id, payload) {
    const res = await apiClient.put(`/markets/${id}`, payload);
    return res.data;
  },

  async deleteMarket(id) {
    return apiClient.delete(`/markets/${id}`);
  },

  async associateFarmer(id, action = 'join') {
    return apiClient.post(`/markets/${id}/associate`, { action });
  },
};

export default marketService;
