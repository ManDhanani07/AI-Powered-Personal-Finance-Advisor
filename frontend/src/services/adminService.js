import apiClient from '../api/client.js';

export const adminService = {
  // ── 1. Overview Mission Control ──
  getOverview: async (params = {}) => {
    const res = await apiClient.get('/admin/overview', { params });
    return res.data || res;
  },

  // ── 2. Users Management & Actions ──
  getUsers: async (params = {}) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data || res;
  },

  getUserDetails: async (userId) => {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data || res;
  },

  updateUserStatus: async (userId, isActive) => {
    const res = await apiClient.put(`/admin/users/${userId}/status`, { is_active: isActive });
    return res.data || res;
  },

  executeUserAction: async (userId, action) => {
    const res = await apiClient.post(`/admin/users/${userId}/action`, { action });
    return res.data || res;
  },

  deleteUser: async (userId) => {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return res.data || res;
  },

  // ── 3. Transaction Operations & Data Quality Center ──
  getTransactionSummary: async (range = '30d') => {
    const res = await apiClient.get('/admin/transactions/summary', { params: { range } });
    return res.data || res;
  },

  getTransactionQuality: async (range = '30d') => {
    const res = await apiClient.get('/admin/transactions/quality', { params: { range } });
    return res.data || res;
  },

  getTransactionTrends: async (range = '30d') => {
    const res = await apiClient.get('/admin/transactions/trends', { params: { range } });
    return res.data || res;
  },

  getTransactionExceptions: async (range = '30d') => {
    const res = await apiClient.get('/admin/transactions/exceptions', { params: { range } });
    return res.data || res;
  },

  getTransactions: async (params = {}) => {
    const res = await apiClient.get('/admin/transactions', { params });
    return res.data || res;
  },

  getTransactionDetail: async (transactionId) => {
    const res = await apiClient.get(`/admin/transactions/${transactionId}`);
    return res.data || res;
  },

  executeTransactionAction: async (transactionId, payload) => {
    const res = await apiClient.post(`/admin/transactions/${transactionId}/action`, payload);
    return res.data || res;
  },

  // ── 4. AI & ML Operations Center ──
  getAiModels: async () => {
    const res = await apiClient.get('/admin/ai-ml/models');
    return res.data || res;
  },

  getModelVersions: async () => {
    const res = await apiClient.get('/admin/ai-ml/versions');
    return res.data || res;
  },

  rollbackModel: async (payload) => {
    const res = await apiClient.post('/admin/ai-ml/rollback', payload);
    return res.data || res;
  },

  getAiFeedback: async () => {
    const res = await apiClient.get('/admin/ai-ml/feedback');
    return res.data || res;
  },

  // ── 5. Risk & Security Center ──
  getRiskSecurityOverview: async () => {
    const res = await apiClient.get('/admin/risk-security/overview');
    return res.data || res;
  },

  resolveSecurityAlert: async (payload) => {
    const res = await apiClient.post('/admin/risk-security/resolve-alert', payload);
    return res.data || res;
  },

  // ── 7. Data Management & Imports ──
  getDatasets: async () => {
    const res = await apiClient.get('/admin/data-management/datasets');
    return res.data || res;
  },

  getImportJobs: async (params = {}) => {
    const res = await apiClient.get('/admin/data-management/import-jobs', { params });
    return res.data || res;
  },

  getCategorizationRules: async (params = {}) => {
    const res = await apiClient.get('/admin/data-management/categorization-rules', { params });
    return res.data || res;
  },

  createCategorizationRule: async (payload) => {
    const res = await apiClient.post('/admin/data-management/categorization-rules', payload);
    window.dispatchEvent(new CustomEvent('categorization_rules_updated'));
    return res.data || res;
  },

  updateCategorizationRule: async (ruleId, payload) => {
    const res = await apiClient.put(`/admin/data-management/categorization-rules/${ruleId}`, payload);
    window.dispatchEvent(new CustomEvent('categorization_rules_updated'));
    return res.data || res;
  },

  deleteCategorizationRule: async (ruleId) => {
    const res = await apiClient.delete(`/admin/data-management/categorization-rules/${ruleId}`);
    window.dispatchEvent(new CustomEvent('categorization_rules_updated'));
    return res.data || res;
  },


  // ── 9. Support & Issue Ticketing ──
  getSupportTickets: async () => {
    const res = await apiClient.get('/admin/support/tickets');
    return res.data || res;
  },

  updateSupportTicket: async (ticketId, payload) => {
    const res = await apiClient.put(`/admin/support/tickets/${ticketId}`, payload);
    return res.data || res;
  },

  // ── 10. System Console & Telemetry ──
  getSystemTelemetry: async () => {
    const res = await apiClient.get('/admin/system/telemetry');
    return res.data || res;
  },

  getSystemConfig: async () => {
    const res = await apiClient.get('/admin/system/config');
    return res.data || res;
  },

  updateSystemConfig: async (payload) => {
    const res = await apiClient.put('/admin/system/config', payload);
    return res.data || res;
  },

  // ── 11. Immutable Audit Logs ──
  getAuditLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data || res;
  },

  // ── Legacy Compatibility ──
  getFinancialActivity: async () => {
    const res = await apiClient.get('/admin/financial-activity');
    return res.data || res;
  },

  getAiUsage: async () => {
    const res = await apiClient.get('/admin/ai-usage');
    return res.data || res;
  },

  getBudgetsGoals: async () => {
    const res = await apiClient.get('/admin/budgets-goals');
    return res.data || res;
  },

  getSystemHealth: async () => {
    const res = await apiClient.get('/admin/system-health');
    return res.data || res;
  },
};

export default adminService;
