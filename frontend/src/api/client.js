import axios from 'axios';
import { API_URLS, STORAGE_KEYS } from '../constants/index.js';
import { getItem, setItem, removeItem } from '../utils/storage.js';

/**
 * Enterprise Axios Client Instance
 */
const apiClient = axios.create({
  baseURL: API_URLS.BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor - Attach Auth Headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor - Automatic Token Refresh & Global Error Handling
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (response.config?.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    let errorData = error.response?.data;
    if (typeof Blob !== 'undefined' && errorData instanceof Blob) {
      try {
        const text = await errorData.text();
        errorData = JSON.parse(text);
      } catch (parseErr) {
        // non-JSON blob error text
      }
    }

    const customError = {
      message: errorData?.message || errorData?.detail || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: errorData || null,
    };

    // Handle 401 Unauthorized & Automatic Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(customError);
      }

      const refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${API_URLS.BASE_URL}${API_URLS.AUTH.REFRESH}`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: new_refresh_token } = res.data.data;
          setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
          if (new_refresh_token) {
            setItem(STORAGE_KEYS.REFRESH_TOKEN, new_refresh_token);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          processQueue(null, access_token);
          isRefreshing = false;

          return apiClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          removeItem(STORAGE_KEYS.AUTH_TOKEN);
          removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(customError);
        }
      } else {
        removeItem(STORAGE_KEYS.AUTH_TOKEN);
        removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(customError);
      }
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
