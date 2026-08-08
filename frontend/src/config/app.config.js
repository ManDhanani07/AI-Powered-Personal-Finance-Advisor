export const appConfig = {
  name: 'AI-Powered Personal Finance Advisor',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD || false,
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeoutMs: 60000,
    retryCount: 2,
  },
  queryClient: {
    defaultStaleTimeMs: 1000 * 60 * 5, // 5 minutes
    defaultGcTimeMs: 1000 * 60 * 30, // 30 minutes
  },
  toast: {
    autoCloseMs: 4000,
    position: 'top-right',
  },
};
