import apiClient from './apiClient';

export const orderService = {
  async createPreOrder(payload) {
    const res = await apiClient.post('/orders', payload);
    return res.data;
  },

  async getCustomerOrders(params = {}) {
    const res = await apiClient.get('/orders/customer', params);
    return res;
  },

  async getFarmerOrders(params = {}) {
    const res = await apiClient.get('/orders/farmer', params);
    return res;
  },

  async getAllOrders(params = {}) {
    const res = await apiClient.get('/orders', params);
    return res;
  },

  async getOrderById(id) {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  async updateOrderStatus(id, status, details = {}) {
    const res = await apiClient.patch(`/orders/${id}/status`, { status, ...details });
    return res.data;
  },

  async cancelOrder(id, reason) {
    const res = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  async reorder(id) {
    const res = await apiClient.post(`/orders/${id}/reorder`);
    return res.data;
  },

  // Pickup Slots
  async getPickupSlots(params = {}) {
    const res = await apiClient.get('/pickup-slots', params);
    return res.data;
  },

  async createPickupSlot(payload) {
    const res = await apiClient.post('/pickup-slots', payload);
    return res.data;
  },

  async deletePickupSlot(id) {
    return apiClient.delete(`/pickup-slots/${id}`);
  },
};

export default orderService;
