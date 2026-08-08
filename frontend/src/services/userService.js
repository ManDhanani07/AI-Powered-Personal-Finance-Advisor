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
