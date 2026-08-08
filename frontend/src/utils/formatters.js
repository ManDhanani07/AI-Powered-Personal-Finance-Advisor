import { APP_CONSTANTS } from '../constants/index.js';

/**
 * Format currency amount into INR (Indian Rupees) format
 * @param {number} amount
 * @param {string} currency
 * @param {string} locale
 * @returns {string}
 */
export const formatCurrency = (
  amount,
  currency = APP_CONSTANTS.DEFAULT_CURRENCY,
  locale = APP_CONSTANTS.DEFAULT_LOCALE
) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return '₹0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Format number into standard Indian locale string
 * @param {number} value
 * @param {string} locale
 * @returns {string}
 */
export const formatNumber = (value, locale = APP_CONSTANTS.DEFAULT_LOCALE) => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) return '0';
  return new Intl.NumberFormat(locale).format(numericValue);
};

/**
 * Format date into human-readable string
 * @param {string | Date} dateInput
 * @param {Object} options
 * @returns {string}
 */
export const formatDate = (dateInput, options = null) => {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat(
    APP_CONSTANTS.DEFAULT_LOCALE,
    options || defaultOptions
  ).format(date);
};

/**
 * Abbreviate large financial values in Lakhs / Crores
 * @param {number} amount
 * @returns {string}
 */
export const formatCompactFinancial = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)} k`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
};
