import apiClient from '../api/client.js';

export const adminService = {
  getOverview: async () => {
    const res = await apiClient.get('/admin/overview');
    return res.data || res;
  },

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

  getTransactions: async (params = {}) => {
    const res = await apiClient.get('/admin/transactions', { params });
    return res.data || res;
  },

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

  getAuditLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data || res;
  },
};

export default adminService;
