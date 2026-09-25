export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  CATEGORIES: '/categories',
  BUDGETS: '/budgets',
  GOALS: '/goals',
  FINANCIAL_HEALTH: '/financial-health',
  EXPENSE_PREDICTION: '/expense-prediction',
  REPORTS: '/reports',
  AI_ADVISOR: '/ai',
  PROFILE: '/profile',
  SECURITY: '/security',
  SUPPORT: '/support',
  ADMIN: {
    OVERVIEW: '/admin/overview',
    USERS: '/admin/users',
    TRANSACTIONS: '/admin/transactions',
    AI_ML: '/admin/ai-ml',
    RISK_SECURITY: '/admin/risk-security',
    DATA_MANAGEMENT: '/admin/data-management',
    SUPPORT: '/admin/support',
    SYSTEM: '/admin/system',
  },
  NOT_FOUND: '/404',
};

export const API_URLS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_CODE: '/auth/resend-verification-code',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    SUMMARY: '/transactions/summary',
    IMPORT_PREVIEW: '/transactions/import-csv/preview',
    IMPORT_CONFIRM: '/transactions/import-csv/confirm',
    IMPORT_SAMPLE: '/transactions/import-csv/sample',
  },
};

export const STORAGE_KEYS = {
  THEME: 'fintech_theme_mode',
  AUTH_TOKEN: 'fintech_auth_token',
  REFRESH_TOKEN: 'fintech_refresh_token',
  USER_PREFERENCES: 'fintech_user_prefs',
};

export const APP_CONSTANTS = {
  APP_NAME: 'AI-Powered Personal Finance Advisor',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_LOCALE: 'en-IN',
  DATE_FORMAT: 'DD MMM YYYY',
  PAGINATION_LIMIT: 20,
};

export const THEME_CONSTANTS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};
