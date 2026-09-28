import apiClient from './apiClient';

export const mapService = {
  async getConfig() {
    const res = await apiClient.get('/maps/config');
    return res.data;
  },

  async getFarmerLocations(params = {}) {
    const res = await apiClient.get('/maps/farmers', params);
    return res.data;
  },

  async getNearby(lat, lng, radiusKm = 50, type = 'all') {
    const res = await apiClient.get('/maps/nearby', { lat, lng, radiusKm, type });
    return res;
  },
};

export default mapService;
