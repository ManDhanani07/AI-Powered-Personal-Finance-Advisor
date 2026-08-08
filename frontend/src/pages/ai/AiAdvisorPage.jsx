import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import AIChat from '../../components/ai/AIChat.jsx';

export const AiAdvisorPage = () => {
  return (
    <PageContainer
      title="Gemini AI Financial Copilot"
      description="Conversational financial intelligence powered by Google Gemini API and your live PostgreSQL ledger."
    >
      <AIChat />
    </PageContainer>
  );
};

export default AiAdvisorPage;
