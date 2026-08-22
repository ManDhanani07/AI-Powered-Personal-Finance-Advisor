import apiClient from '../api/client.js';

export const userService = {
  /**
   * Get User Profile Details
   */
  async getProfile() {
    return await apiClient.get('/user/profile');
  },

  /**
   * Update Profile Details (name, phone, occupation, monthly income, location)
   */
  async updateProfile(data) {
    return await apiClient.put('/user/profile', data);
  },

  /**
   * Upload Profile Avatar Picture (PNG/JPEG/WEBP <= 5MB)
   */
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post('/user/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Remove Profile Avatar Picture
   */
  async removeProfilePicture() {
    return await apiClient.delete('/user/remove-profile-picture');
  },

  /**
   * Get User Preferences
   */
  async getPreferences() {
    return await apiClient.get('/user/preferences');
  },

  /**
   * Save User Preferences
   */
  async updatePreferences(preferences) {
    return await apiClient.put('/user/preferences', { preferences });
  },

  /**
   * Toggle Two-Factor Authentication
   */
  async toggle2FA(enabled) {
    return await apiClient.put('/user/2fa', { enabled });
  },

  /**
   * Toggle Security Login Alerts
   */
  async toggleSecurityAlerts(enabled) {
    return await apiClient.put('/user/security-alerts', { enabled });
  },

  /**
   * Get Active Sessions & Logged-in Devices
   */
  async getSessions() {
    return await apiClient.get('/user/sessions');
  },

  /**
   * Revoke All Other Device Sessions
   */
  async revokeOtherSessions() {
    return await apiClient.post('/user/sessions/revoke-all-others');
  },

  /**
   * Get Recent Login Activity Audit History
   */
  async getLoginHistory() {
    return await apiClient.get('/user/login-history');
  },

  /**
   * Permanently Delete User Account
   */
  async deleteAccount(password, confirmationText = 'DELETE') {
    return await apiClient.delete('/user/delete-account', {
      data: {
        password,
        confirmation_text: confirmationText,
      },
    });
  },
};

export default userService;
