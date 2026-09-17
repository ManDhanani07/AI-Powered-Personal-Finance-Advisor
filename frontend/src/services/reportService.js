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
   * Fetch advanced reporting analytics (50/30/20 allocation, solvency ratios, tax deductibles, recurring audit)
   */
  async getAdvancedAnalytics(filter = 'all', customStart = null, customEnd = null) {
    try {
      const params = { filter };
      if (customStart) params.custom_start = customStart;
      if (customEnd) params.custom_end = customEnd;
      const response = await apiClient.get('/reports/advanced-analytics', { params });
      return response.data || response;
    } catch (err) {
      console.warn('Advanced analytics fetch failed:', err);
      return null;
    }
  },

  /**
   * Download exported report file (PDF or Excel)
   */
  async downloadReportFile(format = 'pdf', type = 'executive', filter = 'this_month', customStart = null, customEnd = null) {
    const normFormat = format === 'xlsx' || format === 'excel' ? 'xlsx' : 'pdf';
    const params = { format: normFormat, type, filter };
    if (customStart) params.custom_start = customStart;
    if (customEnd) params.custom_end = customEnd;

    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });

    const disposition = response?.headers
      ? (response.headers['content-disposition'] ||
         response.headers['Content-Disposition'] ||
         (typeof response.headers.get === 'function' ? response.headers.get('content-disposition') : null))
      : null;

    let filename = `Executive_Financial_Report.${normFormat}`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = match[1].trim();
      }
    }

    const mimeType = normFormat === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

    const rawBlob = response?.data instanceof Blob
      ? response.data
      : (response instanceof Blob ? response : new Blob([response?.data || response], { type: mimeType }));

    const url = window.URL.createObjectURL(rawBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

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

  async getForecastData() {
    try {
      const response = await apiClient.get('/expense-prediction/forecast');
      return response.data || response;
    } catch (err) {
      console.warn('Expense forecast fetch in reportService failed (using fallback):', err);
      return null;
    }
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
  getGoalAnalysis() {
    return apiClient.get('/reports/goal-analysis').then((res) => res.data || res).catch(() => null);
  },
  getIncomeVsExpense(filter = 'this_month', customStart = null, customEnd = null) {
    return this.getIncomeExpenseReport(filter, customStart, customEnd);
  },
};

export default reportService;
