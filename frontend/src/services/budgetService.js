import apiClient from '../api/client.js';

export const budgetService = {
  /**
   * Get paginated budgets list
   */
  async getBudgets(params = {}) {
    return await apiClient.get('/budgets', { params });
  },

  /**
   * Get overall budget summary statistics
   */
  async getBudgetSummary() {
    return await apiClient.get('/budgets/summary');
  },

  /**
   * Get automated threshold alerts
   */
  async getBudgetAlerts() {
    return await apiClient.get('/budgets/alerts');
  },

  /**
   * Get single budget by ID
   */
  async getById(id) {
    return await apiClient.get(`/budgets/${id}`);
  },

  /**
   * Create a new budget
   */
  async createBudget(data) {
    return await apiClient.post('/budgets', data);
  },

  /**
   * Update budget
   */
  async updateBudget(id, data) {
    return await apiClient.put(`/budgets/${id}`, data);
  },

  /**
   * Delete budget
   */
  async deleteBudget(id) {
    return await apiClient.delete(`/budgets/${id}`);
  },

  /**
   * Get Intelligent Budget Management System analytics
   */
  async getBudgetIntelligence() {
    return await apiClient.get('/budgets/intelligence');
  },

  /**
   * Reallocate budget from source to target envelope
   */
  async reallocateBudget(data) {
    return await apiClient.post('/budgets/reallocate', data);
  },

  /**
   * Validate transaction amount against category budget
   */
  async validateTransactionBudget(data) {
    return await apiClient.post('/budgets/validate-transaction', data);
  },
};

export default budgetService;
