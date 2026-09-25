import apiClient from '../api/client.js';

export const categoryService = {
  /**
   * Get all categories with optional category_type filter
   */
  async getCategories(params = {}) {
    return await apiClient.get('/categories', { params });
  },

  /**
   * Get Category Breakdown with historical monthly averages, variance, and anomaly flags
   */
  async getCategoryBreakdownAnalytics(params = {}) {
    const res = await apiClient.get('/categories/breakdown-analytics', { params });
    return res.data || res;
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

  /**
   * Get active merchant categorization rules for real-time form detection
   */
  async getActiveRules(force = false) {
    const now = Date.now();
    if (!force && cachedRules && (now - lastRulesFetch < CACHE_TTL_MS)) {
      return cachedRules;
    }
    try {
      const res = await apiClient.get('/categories/rules');
      cachedRules = res.data?.data || res.data || [];
      lastRulesFetch = now;
      return cachedRules;
    } catch (e) {
      console.warn('Failed to fetch active categorization rules:', e);
      return cachedRules || [];
    }
  },

  /**
   * Invalidate cached categorization rules
   */
  clearRulesCache() {
    cachedRules = null;
    lastRulesFetch = 0;
  },
};

let cachedRules = null;
let lastRulesFetch = 0;
const CACHE_TTL_MS = 60000;

export default categoryService;
