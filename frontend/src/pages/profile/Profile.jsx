import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfileCard from '../../components/profile/ProfileCard.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import ConnectedBanksPanel from '../../components/profile/ConnectedBanksPanel.jsx';
import SecuritySuite from '../../components/profile/SecuritySuite.jsx';
import NotificationsMatrix from '../../components/profile/NotificationsMatrix.jsx';

export const Profile = () => {
  const { user, loadCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'banks' | 'security' | 'notifications'

  const handleAvatarChange = () => {
    loadCurrentUser();
  };

  const handleProfileUpdated = () => {
    loadCurrentUser();
    setIsEditing(false);
  };

  return (
    <PageContainer
      title="User Profile & Account Hub"
      description="Manage profile specifications, linked bank accounts, 2FA security controls, and system preferences."
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />

        {/* Section Tabs Navigation */}
        <div className="flex border-b border-border-subtle space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Profile Specifications' },
            { id: 'banks', label: 'Connected Banks (AA Hub)' },
            { id: 'security', label: 'Security & 2FA Suite' },
            { id: 'notifications', label: 'Granular Notifications' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-primary-500 text-primary-500 bg-primary-500/10 rounded-t-2xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Displays */}
        {activeTab === 'profile' && (
          isEditing ? (
            <ProfileForm user={user} onCancel={() => setIsEditing(false)} onSuccess={handleProfileUpdated} />
          ) : (
            <ProfileCard user={user} onEditClick={() => setIsEditing(true)} />
          )
        )}

        {activeTab === 'banks' && <ConnectedBanksPanel />}

        {activeTab === 'security' && <SecuritySuite />}

        {activeTab === 'notifications' && <NotificationsMatrix />}
      </div>
    </PageContainer>
  );
};

export default Profile;
