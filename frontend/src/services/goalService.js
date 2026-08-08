import apiClient from '../api/client.js';

export const goalService = {
  /**
   * Get paginated savings goals list
   */
  async getGoals(params = {}) {
    return await apiClient.get('/goals', { params });
  },

  /**
   * Get savings goals overall summary metrics
   */
  async getGoalSummary() {
    return await apiClient.get('/goals/summary');
  },

  /**
   * Get smart AI goal recommendations and warnings
   */
  async getGoalRecommendations() {
    return await apiClient.get('/goals/recommendations');
  },

  /**
   * Get single goal by ID
   */
  async getById(id) {
    return await apiClient.get(`/goals/${id}`);
  },

  /**
   * Create a new savings goal
   */
  async createGoal(data) {
    return await apiClient.post('/goals', data);
  },

  /**
   * Update goal details
   */
  async updateGoal(id, data) {
    return await apiClient.put(`/goals/${id}`, data);
  },

  /**
   * Update goal status (PAUSED, IN_PROGRESS, ACHIEVED, ARCHIVED)
   */
  async updateGoalStatus(id, status) {
    return await apiClient.patch(`/goals/${id}/status`, null, { params: { status } });
  },

  /**
   * Deposit funds into Goal Vault (deducting from monthly surplus)
   */
  async depositGoal(id, data) {
    return await apiClient.post(`/goals/${id}/deposit`, data);
  },

  /**
   * Delete goal
   */
  async deleteGoal(id) {
    return await apiClient.delete(`/goals/${id}`);
  },
};

export default goalService;
