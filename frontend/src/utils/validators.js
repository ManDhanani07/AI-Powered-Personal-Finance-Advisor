/**
 * Validation Helpers for inputs and fields
 */

export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isStrongPassword = (password) => {
  if (typeof password !== 'string') return false;
  // Minimum 8 characters, at least 1 letter and 1 number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const isValidPAN = (pan) => {
  if (typeof pan !== 'string') return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase().trim());
};
