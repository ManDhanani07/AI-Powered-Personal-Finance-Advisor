import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import NotificationsMatrix from '../../components/profile/NotificationsMatrix.jsx';
import PreferencesCard from '../../components/profile/PreferencesCard.jsx';

export const Preferences = () => {
  return (
    <PageContainer
      title="System & Notification Preferences"
      description="Configure theme settings, regional formats, and channel notification matrix."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <PreferencesCard />
        <NotificationsMatrix />
      </div>
    </PageContainer>
  );
};

export default Preferences;
