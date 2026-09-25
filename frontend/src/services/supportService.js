import apiClient from '../api/client.js';

export const supportService = {
  /**
   * Retrieve all problem reports / tickets submitted by the authenticated user
   */
  getMyTickets: async (params = {}) => {
    const res = await apiClient.get('/support/tickets', { params });
    return res.data || res;
  },

  /**
   * Submit a new problem report or customer care issue
   */
  submitTicket: async (payload) => {
    const res = await apiClient.post('/support/tickets', payload);
    return res.data || res;
  },

  /**
   * Retrieve specific ticket details with resolution and admin reply history
   */
  getTicketDetail: async (ticketId) => {
    const res = await apiClient.get(`/support/tickets/${ticketId}`);
    return res.data || res;
  },
};

export default supportService;
