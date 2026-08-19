import apiClient from '../api/client.js';

export const reportService = {
  /**
   * Fetch executive reports dashboard summary
   */
  async getDashboardSummary(filter = 'this_month', customStart = null, customEnd = null, comparePrevious = false) {
    const params = { filter };
    if (customStart) params.custom_start = customStart;
    if (customEnd) params.custom_end = customEnd;
    if (comparePrevious) params.compare_previous = true;
    const response = await apiClient.get('/reports/dashboard-summary', { params });
    return response.data;
  },

  /**
   * Fetch monthly breakdown report
   */
  async getMonthlyReport(year = null) {
    const params = year ? { year } : {};
    const response = await apiClient.get('/reports/monthly', { params });
    return response.data;
  },

  /**
   * Fetch yearly performance report
   */
  async getYearlyReport() {
    const response = await apiClient.get('/reports/yearly');
    return response.data;
  },

  /**
   * Fetch category & merchant spending analysis
   */
  async getCategoryAnalysis(filter = 'this_month', customStart = null, customEnd = null) {
    const params = { filter };
    if (customStart) params.custom_start = customStart;
    if (customEnd) params.custom_end = customEnd;
    const response = await apiClient.get('/reports/category-analysis', { params });
    return response.data;
  },

  /**
   * Fetch income vs expense report
   */
  async getIncomeExpenseReport(filter = 'this_month', customStart = null, customEnd = null) {
    const params = { filter };
    if (customStart) params.custom_start = customStart;
    if (customEnd) params.custom_end = customEnd;
    const response = await apiClient.get('/reports/income-expense', { params });
    return response.data;
  },

  /**
   * Fetch savings accumulation analysis
   */
  async getSavingsAnalysis() {
    const response = await apiClient.get('/reports/savings-analysis');
    return response.data;
  },

  /**
   * Fetch budget utilization & performance report
   */
  async getBudgetAnalysis() {
    const response = await apiClient.get('/reports/budget-analysis');
    return response.data;
  },

  /**
   * Fetch goal completion report
   */
  async getGoalAnalysis() {
    const response = await apiClient.get('/reports/goal-analysis');
    return response.data;
  },

  /**
   * Fetch financial health score trend report
   */
  async getFinancialHealthReport() {
    const response = await apiClient.get('/reports/financial-health');
    return response.data;
  },

  /**
   * Download exported report file (PDF, Excel, CSV)
   */
  async downloadReportFile(format = 'csv', type = 'executive', filter = 'this_month', customStart = null, customEnd = null) {
    const params = { format, type, filter };
    if (customStart) params.custom_start = customStart;
    if (customEnd) params.custom_end = customEnd;

    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'];
    let filename = `Executive_Financial_Report.${format}`;
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/"/g, '');
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { filename };
  },

  /**
   * Fetch structured AI financial analysis summary
   */
  async generateAiSummary(filter = 'this_month', customStart = null, customEnd = null) {
    const params = { filter };
    if (customStart) params.custom_start = customStart;
    if (customEnd) params.custom_end = customEnd;
    const response = await apiClient.post('/reports/ai-summary', null, { params });
    return response.data;
  },

  // Compatibility Alias Mappings
  getMonthlyBreakdown(year = null) {
    return this.getMonthlyReport(year);
  },
  getHealthScoreTrend() {
    return this.getFinancialHealthReport();
  },
  getBudgetPerformance() {
    return this.getBudgetAnalysis();
  },
  getIncomeVsExpense(filter = 'this_month', customStart = null, customEnd = null) {
    return this.getIncomeExpenseReport(filter, customStart, customEnd);
  },
};

export default reportService;
