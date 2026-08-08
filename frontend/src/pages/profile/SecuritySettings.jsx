import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import SecuritySuite from '../../components/profile/SecuritySuite.jsx';

export const SecuritySettings = () => {
  return (
    <PageContainer
      title="Security & 2FA Suite"
      description="Setup two-factor authenticator codes, manage device sessions, and update credentials."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <SecuritySuite />
      </div>
    </PageContainer>
  );
};

export default SecuritySettings;
