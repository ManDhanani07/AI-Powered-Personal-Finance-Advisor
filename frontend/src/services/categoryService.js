import apiClient from '../api/client.js';

export const categoryService = {
  /**
   * Get all categories with optional category_type filter
   */
  async getCategories(params = {}) {
    return await apiClient.get('/categories', { params });
  },

  /**
   * Get system default categories
   */
  async getDefaultCategories() {
    return await apiClient.get('/categories/default');
  },

  /**
   * Get custom user categories
   */
  async getCustomCategories() {
    return await apiClient.get('/categories/custom');
  },

  /**
   * Get category by ID
   */
  async getById(id) {
    return await apiClient.get(`/categories/${id}`);
  },

  /**
   * Create a new category
   */
  async createCategory(data) {
    return await apiClient.post('/categories', data);
  },

  /**
   * Update category details
   */
  async updateCategory(id, data) {
    return await apiClient.put(`/categories/${id}`, data);
  },

  /**
   * Duplicate category
   */
  async duplicateCategory(id) {
    return await apiClient.post(`/categories/${id}/duplicate`);
  },

  /**
   * Delete a category
   */
  async deleteCategory(id) {
    return await apiClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
