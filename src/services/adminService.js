import apiClient from './apiClient';

export const adminService = {
  async getDashboardStats() {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  async approveFarmer(farmerId) {
    const res = await apiClient.post(`/admin/farmers/${farmerId}/approve`);
    return res.data;
  },

  async suspendFarmer(farmerId, reason = '') {
    const res = await apiClient.post(`/admin/farmers/${farmerId}/suspend`, { reason });
    return res.data;
  },

  async getCustomers(params = {}) {
    const res = await apiClient.get('/users', { ...params, role: 'customer' });
    return res;
  },

  async updateCustomerStatus(customerId, status) {
    const res = await apiClient.put(`/admin/customers/${customerId}/status`, { status });
    return res.data;
  },

  async getReports() {
    const res = await apiClient.get('/reports');
    return res.data;
  },

  async getAnnouncements(params = {}) {
    const res = await apiClient.get('/announcements', params);
    return res.data;
  },

  async createAnnouncement(payload) {
    const res = await apiClient.post('/announcements', payload);
    return res.data;
  },

  async updateAnnouncement(id, payload) {
    const res = await apiClient.put(`/announcements/${id}`, payload);
    return res.data;
  },

  async deleteAnnouncement(id) {
    return apiClient.delete(`/announcements/${id}`);
  },

  async getCategories() {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  async createCategory(payload) {
    const res = await apiClient.post('/categories', payload);
    return res.data;
  },

  async updateCategory(id, payload) {
    const res = await apiClient.put(`/categories/${id}`, payload);
    return res.data;
  },

  async deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`);
  },
};

export default adminService;
