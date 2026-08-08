import apiClient from '../api/client.js';

export const financialHealthService = {
  /**
   * Get current financial health score, grade, parameters & recommendations
   */
  async getScore() {
    return await apiClient.get('/financial-health');
  },

  /**
   * Get historical score trajectory over time
   */
  async getHistory(limit = 12) {
    return await apiClient.get('/financial-health/history', { params: { limit } });
  },

  /**
   * Get parameter weight distribution breakdown
   */
  async getBreakdown() {
    return await apiClient.get('/financial-health/breakdown');
  },
};

export default financialHealthService;
