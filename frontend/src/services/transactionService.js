import apiClient from '../api/client.js';

export const transactionService = {
  /**
   * Get paginated transactions list with search and filters
   */
  async getTransactions(params = {}) {
    return await apiClient.get('/transactions', { params });
  },

  /**
   * Alias for getTransactions
   */
  async getAll(params = {}) {
    return await this.getTransactions(params);
  },

  /**
   * Get transaction summary statistics (Total Income, Total Expense, Net Balance)
   */
  async getSummary() {
    return await apiClient.get('/transactions/summary');
  },

  /**
   * Get top recent transactions
   */
  async getRecent(limit = 5) {
    return await apiClient.get('/transactions/recent', { params: { limit } });
  },

  /**
   * Get single transaction details
   */
  async getById(id) {
    return await apiClient.get(`/transactions/${id}`);
  },

  /**
   * Create a new transaction with auto merchant recognition
   */
  async createTransaction(data) {
    return await apiClient.post('/transactions', data);
  },

  /**
   * Alias for createTransaction
   */
  async create(data) {
    return await this.createTransaction(data);
  },

  /**
   * Update transaction details
   */
  async updateTransaction(id, data) {
    return await apiClient.put(`/transactions/${id}`, data);
  },

  /**
   * Alias for updateTransaction
   */
  async update(id, data) {
    return await this.updateTransaction(id, data);
  },

  /**
   * Duplicate an existing transaction
   */
  async duplicateTransaction(id) {
    return await apiClient.post(`/transactions/${id}/duplicate`);
  },

  /**
   * Alias for duplicateTransaction
   */
  async duplicate(id) {
    return await this.duplicateTransaction(id);
  },

  /**
   * Restore a soft-deleted transaction
   */
  async restoreTransaction(id) {
    return await apiClient.post(`/transactions/${id}/restore`);
  },

  /**
   * Alias for restoreTransaction
   */
  async restore(id) {
    return await this.restoreTransaction(id);
  },

  /**
   * Delete a transaction (soft delete by default, or hard delete)
   */
  async deleteTransaction(id, hard = false) {
    return await apiClient.delete(`/transactions/${id}`, { params: { hard } });
  },

  /**
   * Alias for deleteTransaction
   */
  async delete(id, hard = false) {
    return await this.deleteTransaction(id, hard);
  },

  /**
   * Seed 12-month sample transaction ledger
   */
  async seedTransactions() {
    return await apiClient.post('/transactions/seed');
  },

  /**
   * Upload CSV file for preview, column mapping, and duplicate detection
   */
  async previewCsvImport(formData) {
    return await apiClient.post('/transactions/import-csv/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Confirm and execute batch insertion of imported transactions
   */
  async confirmCsvImport(payload) {
    return await apiClient.post('/transactions/import-csv/confirm', payload);
  },

  /**
   * Download sample CSV template
   */
  async downloadSampleCsv() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}/transactions/import-csv/sample`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download sample CSV:', err);
    }
  },
};

export default transactionService;
