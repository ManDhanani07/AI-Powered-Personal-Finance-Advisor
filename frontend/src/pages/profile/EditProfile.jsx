import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import { ROUTES } from '../../constants/index.js';

export const EditProfile = () => {
  const { user, loadCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    loadCurrentUser();
    navigate(ROUTES.PROFILE);
  };

  return (
    <PageContainer
      title="Edit Profile"
      description="Update your personal information, monthly income, and location specs."
    >
      <div className="max-w-3xl mx-auto">
        <ProfileForm
          user={user}
          onCancel={() => navigate(ROUTES.PROFILE)}
          onSuccess={handleSuccess}
        />
      </div>
    </PageContainer>
  );
};

export default EditProfile;
