import apiClient from './apiClient';

export const reviewService = {
  async getReviews(params = {}) {
    const res = await apiClient.get('/reviews', params);
    return res.data;
  },

  async createReview(payload) {
    const res = await apiClient.post('/reviews', payload);
    return res.data;
  },

  async respondToReview(id, comment) {
    const res = await apiClient.post(`/reviews/${id}/respond`, { comment });
    return res.data;
  },

  async moderateReview(id, isModerated) {
    const res = await apiClient.patch(`/reviews/${id}/moderate`, { isModerated });
    return res.data;
  },

  async deleteReview(id) {
    return apiClient.delete(`/reviews/${id}`);
  },
};

export default reviewService;
