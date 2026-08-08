import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ConnectedBanksPanel from '../../components/profile/ConnectedBanksPanel.jsx';

export const AccountSettings = () => {
  return (
    <PageContainer
      title="Connected Bank Accounts"
      description="Manage linked bank accounts and live data synchronization."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <ConnectedBanksPanel />
      </div>
    </PageContainer>
  );
};

export default AccountSettings;
