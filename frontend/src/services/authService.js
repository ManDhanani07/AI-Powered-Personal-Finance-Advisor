import apiClient from '../api/client.js';
import { API_URLS } from '../constants/index.js';

/**
 * Authentication API Service Client
 */
export const authService = {
  /**
   * Register a new user account
   */
  async register(data) {
    return await apiClient.post(API_URLS.AUTH.REGISTER, data);
  },

  /**
   * Verify email address with 6-digit OTP
   */
  async verifyEmail(data) {
    return await apiClient.post(API_URLS.AUTH.VERIFY_EMAIL, data);
  },

  /**
   * Resend 6-digit verification code
   */
  async resendVerificationCode(data) {
    return await apiClient.post(API_URLS.AUTH.RESEND_CODE, data);
  },

  /**
   * Verify password reset 6-digit OTP
   */
  async verifyResetOtp(data) {
    return await apiClient.post(API_URLS.AUTH.VERIFY_RESET_OTP, data);
  },

  /**
   * Log in user with credentials
   */
  async login(data) {
    return await apiClient.post(API_URLS.AUTH.LOGIN, data);
  },

  /**
   * Authenticate via Google OAuth token
   */
  async googleLogin(idToken) {
    return await apiClient.post(API_URLS.AUTH.GOOGLE, { id_token: idToken });
  },

  /**
   * Log out user
   */
  async logout() {
    return await apiClient.post(API_URLS.AUTH.LOGOUT);
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    return await apiClient.post(API_URLS.AUTH.REFRESH, { refresh_token: refreshToken });
  },

  /**
   * Request password reset token
   */
  async forgotPassword(email) {
    return await apiClient.post(API_URLS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    return await apiClient.post(API_URLS.AUTH.RESET_PASSWORD, {
      token,
      new_password: newPassword,
    });
  },

  /**
   * Change user password (authenticated)
   */
  async changePassword(oldPassword, newPassword) {
    return await apiClient.post(API_URLS.AUTH.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    return await apiClient.get(API_URLS.AUTH.ME);
  },
};

export default authService;
