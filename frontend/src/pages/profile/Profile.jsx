import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfileCard from '../../components/profile/ProfileCard.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import PreferencesCard from '../../components/profile/PreferencesCard.jsx';
import SecuritySuite from '../../components/profile/SecuritySuite.jsx';
import { UserCheck, ShieldCheck } from 'lucide-react';

export const Profile = () => {
  const { user, loadCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  const handleAvatarChange = () => {
    loadCurrentUser();
  };

  const handleProfileUpdated = () => {
    loadCurrentUser();
    setIsEditing(false);
  };

  return (
    <PageContainer
      title="Profile & Account Settings"
      description="Manage your personal information, financial preferences, currency, and account security."
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />

        {/* 2 Clean Section Tabs Navigation */}
        <div className="flex border-b border-border-subtle space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Profile & Financial Preferences', icon: UserCheck },
            { id: 'security', label: 'Security & Password', icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-2xl shadow-[0_-4px_12px_rgba(16,185,129,0.1)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/40 rounded-t-xl'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile & Financial Preferences */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {isEditing ? (
              <ProfileForm user={user} onCancel={() => setIsEditing(false)} onSuccess={handleProfileUpdated} />
            ) : (
              <ProfileCard user={user} onEditClick={() => setIsEditing(true)} />
            )}
            <PreferencesCard />
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <SecuritySuite />
        )}
      </div>
    </PageContainer>
  );
};

export default Profile;
