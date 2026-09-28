import apiClient from './apiClient';

export const notificationService = {
  async getNotifications(params = {}) {
    const res = await apiClient.get('/notifications', params);
    return res;
  },

  async markAsRead(id) {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.post('/notifications/mark-all-read');
    return res.data;
  },
};

export default notificationService;
