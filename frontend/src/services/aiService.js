import apiClient from '../api/client.js';

export const aiService = {
  /**
   * Send prompt to Gemini AI assistant with live context
   */
  async sendMessage(message, conversationId = null) {
    const response = await apiClient.post(
      '/ai/chat',
      {
        message,
        conversation_id: conversationId,
      },
      { timeout: 90000 }
    );
    return response?.data ?? response;
  },

  /**
   * Fetch past AI chat conversation history from PostgreSQL
   */
  async getChatHistory(limit = 50) {
    const response = await apiClient.get('/ai/history', {
      params: { limit },
    });
    return response?.data ?? response;
  },

  /**
   * Clear all AI conversation history in PostgreSQL
   */
  async clearChatHistory() {
    const response = await apiClient.delete('/ai/history');
    return response?.data ?? response;
  },

  /**
   * Delete single conversation session
   */
  async deleteConversationSession(conversationId) {
    const response = await apiClient.delete(`/ai/history/session/${conversationId}`);
    return response?.data ?? response;
  },

  /**
   * Send prompt to Gemini AI assistant for reports insight
   */
  async queryAdvisor(message) {
    const response = await apiClient.post(
      '/ai/chat',
      {
        message,
      },
      { timeout: 90000 }
    );
    return response?.data ?? response;
  },
};

export default aiService;
