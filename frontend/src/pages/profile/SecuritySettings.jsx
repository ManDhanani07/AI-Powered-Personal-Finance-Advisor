import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import SecuritySuite from '../../components/profile/SecuritySuite.jsx';

export const SecuritySettings = () => {
  return (
    <PageContainer
      title="Security & Login"
      description="Protect your account and manage how you sign in."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <SecuritySuite />
      </div>
    </PageContainer>
  );
};

export default SecuritySettings;
