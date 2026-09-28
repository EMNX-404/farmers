import apiClient from './apiClient';

export const inventoryService = {
  async getWeeklyInventory(params = {}) {
    const res = await apiClient.get('/inventory', params);
    return res;
  },

  async getMyWeeklyInventory(params = {}) {
    const res = await apiClient.get('/inventory/my-inventory', params);
    return res.data;
  },

  async upsertWeeklyInventory(payload) {
    const res = await apiClient.post('/inventory', payload);
    return res.data;
  },

  async deleteWeeklyInventory(id) {
    return apiClient.delete(`/inventory/${id}`);
  },
};

export default inventoryService;
