import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfileCard from '../../components/profile/ProfileCard.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';

export const Profile = () => {
  const { user, loadCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleAvatarChange = () => {
    loadCurrentUser();
  };

  const handleProfileUpdated = () => {
    loadCurrentUser();
    setIsEditing(false);
  };

  return (
    <PageContainer
      title="My Profile"
      description="Manage your personal information and account details."
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <ProfileHeader
          user={user}
          onAvatarChange={handleAvatarChange}
          onEditClick={() => setIsEditing((prev) => !prev)}
          isEditing={isEditing}
        />

        {isEditing ? (
          <ProfileForm
            user={user}
            onCancel={() => setIsEditing(false)}
            onSuccess={handleProfileUpdated}
          />
        ) : (
          <ProfileCard
            user={user}
            onEditClick={() => setIsEditing(true)}
            onVerifySuccess={() => loadCurrentUser()}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default Profile;
