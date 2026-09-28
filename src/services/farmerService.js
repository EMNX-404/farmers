import apiClient from './apiClient';

export const farmerService = {
  async getFarmers(params = {}) {
    const res = await apiClient.get('/farmers', params);
    return res.data;
  },

  async getFarmerById(id) {
    const res = await apiClient.get(`/farmers/${id}`);
    return res.data;
  },

  async getMyProfile() {
    const res = await apiClient.get('/farmers/me');
    return res.data;
  },

  async updateMyProfile(payload) {
    const res = await apiClient.put('/farmers/me', payload);
    return res.data;
  },

  async updateMyLocation(latitude, longitude, farmAddress) {
    const res = await apiClient.patch('/farmers/me/location', { latitude, longitude, farmAddress });
    return res.data;
  },

  async getAnalytics() {
    const res = await apiClient.get('/farmers/analytics');
    return res.data;
  },
};

export default farmerService;
