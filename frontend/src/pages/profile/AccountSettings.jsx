import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import PreferencesCard from '../../components/profile/PreferencesCard.jsx';

export const AccountSettings = () => {
  return (
    <PageContainer
      title="Financial & System Settings"
      description="Manage default currency, target savings rates, and financial strategy."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <PreferencesCard />
      </div>
    </PageContainer>
  );
};

export default AccountSettings;
