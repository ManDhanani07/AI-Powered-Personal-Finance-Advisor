import apiClient from '../api/client.js';

export const apiService = {
  get: (url, params = {}, config = {}) => apiClient.get(url, { params, ...config }),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};
