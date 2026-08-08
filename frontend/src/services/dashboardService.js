import apiClient from '../api/client.js';

export const dashboardService = {
  /**
   * GET /dashboard/complete
   * Fetches all 7 dashboard sections in 1 fast consolidated request
   */
  async getCompleteDashboard(limit = 10) {
    return await apiClient.get('/dashboard/complete', { params: { limit } });
  },

  /**
   * GET /dashboard/overview
   * 8 KPI cards: balance, income, expense, savings rate, budget, goals
   */
  async getOverview() {
    return await apiClient.get('/dashboard/overview');
  },

  /**
   * GET /dashboard/summary
   * Greeting, date, user name, key financial snapshot
   */
  async getSummary() {
    return await apiClient.get('/dashboard/summary');
  },

  /**
   * GET /dashboard/charts
   * All chart series: income/expense bar, cash flow area, category pie,
   * budget utilization bar, goal progress radial, payment method pie
   */
  async getCharts() {
    return await apiClient.get('/dashboard/charts');
  },

  /**
   * GET /dashboard/recent-transactions
   * @param {number} limit - 10 | 20 | 50
   */
  async getRecentTransactions(limit = 10) {
    return await apiClient.get('/dashboard/recent-transactions', { params: { limit } });
  },

  /**
   * GET /dashboard/budget-overview
   * Active budgets with utilization percentages and status
   */
  async getBudgetOverview() {
    return await apiClient.get('/dashboard/budget-overview');
  },

  /**
   * GET /dashboard/goals-overview
   * Active goals with deadline, progress, required monthly saving
   */
  async getGoalsOverview() {
    return await apiClient.get('/dashboard/goals-overview');
  },

  /**
   * GET /dashboard/spending-analysis
   * Highest/lowest category, avg daily/monthly, largest/smallest transaction
   */
  async getSpendingAnalysis() {
    return await apiClient.get('/dashboard/spending-analysis');
  },
};

export default dashboardService;
