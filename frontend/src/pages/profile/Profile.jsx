import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfileCard from '../../components/profile/ProfileCard.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import userService from '../../services/userService.js';
import compressAvatarImage from '../../utils/imageCompressor.js';
import { toast } from 'react-toastify';

export const Profile = () => {
  const { user, loadCurrentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Staged avatar changes
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [pendingAvatarAction, setPendingAvatarAction] = useState(null); // 'upload' | 'remove' | null
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null); // blob URL string, or 'REMOVED', or null

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatarUrl);
      }
    };
  }, [previewAvatarUrl]);

  // Compute what avatar to display in the header
  const displayedAvatarSrc =
    previewAvatarUrl === 'REMOVED'
      ? null
      : previewAvatarUrl || user?.profile_picture || null;

  // Staged File Selection (Local preview only, NO backend upload yet)
  const handleFileSelect = (file) => {
    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarAction('upload');
    setPreviewAvatarUrl(localUrl);
  };

  // Staged Photo Removal (Local preview fallback only, NO backend deletion yet)
  const handlePhotoRemove = () => {
    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl);
    }
    setPendingAvatarFile(null);
    setPendingAvatarAction('remove');
    setPreviewAvatarUrl('REMOVED');
  };

  // Cancel edit mode: discard all staged avatar changes and revert to original
  const handleCancel = () => {
    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl);
    }
    setPendingAvatarFile(null);
    setPendingAvatarAction(null);
    setPreviewAvatarUrl(null);
    setIsEditing(false);
  };

  // Toggle Edit / Cancel from the header button
  const handleHeaderEditToggle = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  // Save changes handler: commits staged avatar changes and profile details
  const handleSaveProfile = async (formData) => {
    setIsSaving(true);
    try {
      let avatarTask = null;

      if (pendingAvatarAction === 'upload' && pendingAvatarFile) {
        // High-speed client-side compression (< 20ms, WebP/JPEG ~30KB)
        const compressedFile = await compressAvatarImage(pendingAvatarFile, 400, 0.85);
        avatarTask = userService.uploadProfilePicture(compressedFile);
      } else if (pendingAvatarAction === 'remove' && user?.profile_picture) {
        avatarTask = userService.removeProfilePicture();
      }

      // Execute profile data update and avatar upload/removal concurrently
      const [profileRes, avatarRes] = await Promise.all([
        userService.updateProfile(formData),
        avatarTask,
      ]);

      // Optimistically update AuthContext state with new avatar or null
      if (pendingAvatarAction === 'upload' && avatarRes?.data?.profile_picture) {
        if (updateUser) {
          updateUser({ ...formData, profile_picture: avatarRes.data.profile_picture });
        }
      } else if (pendingAvatarAction === 'remove') {
        if (updateUser) {
          updateUser({ ...formData, profile_picture: null });
        }
      } else if (updateUser) {
        updateUser(formData);
      }

      // Clean up staged preview URL
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatarUrl);
      }
      setPendingAvatarFile(null);
      setPendingAvatarAction(null);
      setPreviewAvatarUrl(null);

      // Reload fresh user data from server
      await loadCurrentUser();

      toast.success('Profile updated successfully! ✨');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="My Profile"
      description="Manage your personal information and account details."
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <ProfileHeader
          user={user}
          avatarSrc={displayedAvatarSrc}
          onFileSelect={handleFileSelect}
          onPhotoRemove={handlePhotoRemove}
          onEditClick={handleHeaderEditToggle}
          isEditing={isEditing}
          isSaving={isSaving}
        />

        {isEditing ? (
          <ProfileForm
            user={user}
            onCancel={handleCancel}
            onSave={handleSaveProfile}
            isSaving={isSaving}
          />
        ) : (
          <ProfileCard
            user={user}
            onVerifySuccess={() => loadCurrentUser()}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default Profile;
