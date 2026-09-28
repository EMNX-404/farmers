import apiClient from './apiClient';

export const authService = {
  async registerCustomer(payload) {
    const res = await apiClient.post('/auth/register-customer', payload);
    if (res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res.data;
  },

  async registerFarmer(payload) {
    const res = await apiClient.post('/auth/register-farmer', payload);
    if (res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res.data;
  },

  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res.data;
  },

  async getProfile() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async updateProfile(payload) {
    const res = await apiClient.put('/auth/profile', payload);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    return apiClient.put('/auth/password', { currentPassword, newPassword });
  },

  async forgotPassword(email, newPassword) {
    return apiClient.post('/auth/forgot-password', { email, newPassword });
  },

  logout() {
    apiClient.setToken(null);
  },
};

export default authService;
