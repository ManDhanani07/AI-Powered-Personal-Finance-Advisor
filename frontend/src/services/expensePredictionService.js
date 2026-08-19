import apiClient from '../api/client.js';

export const expensePredictionService = {
  /**
   * Fetch live multi-scale expense prediction, P10/P50/P90 confidence bounds,
   * 3-tier spending breakdown, and safe budget ceilings for authenticated user.
   */
  async getForecast(targetMonth = null) {
    const params = {};
    if (targetMonth) params.target_month = targetMonth;
    const response = await apiClient.get('/expense-prediction/forecast', { params });
    return response.data;
  },

  /**
   * Run interactive scenario simulation with custom adjustments
   * (e.g. income growth %, discretionary spend cut %, target month).
   */
  async simulateScenario(scenarioPayload) {
    const response = await apiClient.post('/expense-prediction/simulate', scenarioPayload);
    return response.data;
  },

  /**
   * Fetch verified engine architecture and accuracy benchmarks.
   */
  async getMetadata() {
    const response = await apiClient.get('/expense-prediction/metadata');
    return response.data;
  },
};

export default expensePredictionService;
