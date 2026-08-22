import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import PreferencesCard from '../../components/profile/PreferencesCard.jsx';

export const Preferences = () => {
  return (
    <PageContainer
      title="Preferences & Settings"
      description="Customize your experience, financial display, and notifications."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <PreferencesCard />
      </div>
    </PageContainer>
  );
};

export default Preferences;
