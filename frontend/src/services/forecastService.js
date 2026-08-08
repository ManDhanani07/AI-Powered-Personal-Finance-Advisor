import apiClient from '../api/client.js';

export const forecastService = {
  /**
   * GET /forecast/summary
   * Consolidates all 4 forecast models + Insights + Smart Warnings
   * @param {number} periodDays - 30 | 90 | 180 | 365
   */
  async getForecastSummary(periodDays = 90) {
    return await apiClient.get('/forecast/summary', { params: { period_days: periodDays } });
  },

  /**
   * GET /forecast/monthly-expense
   */
  async getMonthlyExpenseForecast(periodDays = 90) {
    return await apiClient.get('/forecast/monthly-expense', { params: { period_days: periodDays } });
  },

  /**
   * GET /forecast/monthly-income
   */
  async getMonthlyIncomeForecast(periodDays = 90) {
    return await apiClient.get('/forecast/monthly-income', { params: { period_days: periodDays } });
  },

  /**
   * GET /forecast/savings
   */
  async getSavingsForecast(periodDays = 90) {
    return await apiClient.get('/forecast/savings', { params: { period_days: periodDays } });
  },

  /**
   * GET /forecast/account-balance
   */
  async getAccountBalanceForecast(periodDays = 90) {
    return await apiClient.get('/forecast/account-balance', { params: { period_days: periodDays } });
  },
};

export default forecastService;
