import apiClient from '../api/client.js';

/**
 * Notification Service — all calls use apiClient which already unwraps response.data
 * So `apiClient.get(...)` returns the full API envelope: { success, message, data }
 */
export const notificationService = {
  /**
   * Fetch paginated user notifications with filters
   * Returns: { success, message, data: { items, total_count, unread_count, page, page_size, total_pages } }
   */
  async getNotifications(params = {}) {
    return await apiClient.get('/notifications', { params });
  },

  /**
   * Fetch unread notification count and popover preview list
   * Returns: { success, message, data: { unread_count, latest_notifications } }
   */
  async getUnreadSummary(limit = 5) {
    return await apiClient.get('/notifications/unread', { params: { limit } });
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId) {
    return await apiClient.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead() {
    return await apiClient.put('/notifications/read-all');
  },

  /**
   * Delete single notification
   */
  async deleteNotification(notificationId) {
    return await apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * Trigger dynamic rule engine evaluation
   */
  async generateNotifications() {
    return await apiClient.post('/notifications/generate');
  },
};

export default notificationService;
