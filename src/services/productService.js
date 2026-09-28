import apiClient from './apiClient';

export const productService = {
  async getProducts(params = {}) {
    const res = await apiClient.get('/products', params);
    return res.data;
  },

  async getProductById(id) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async getMyProducts() {
    const res = await apiClient.get('/products/my-products');
    return res.data;
  },

  async createProduct(payload) {
    const res = await apiClient.post('/products', payload);
    return res.data;
  },

  async updateProduct(id, payload) {
    const res = await apiClient.put(`/products/${id}`, payload);
    return res.data;
  },

  async updateProductStock(id, stockQuantity, availabilityStatus, price) {
    const res = await apiClient.patch(`/products/${id}/stock`, {
      stockQuantity,
      availabilityStatus,
      price,
    });
    return res.data;
  },

  async deleteProduct(id) {
    return apiClient.delete(`/products/${id}`);
  },

  async getCategories() {
    const res = await apiClient.get('/categories');
    return res.data;
  },
};

export default productService;
