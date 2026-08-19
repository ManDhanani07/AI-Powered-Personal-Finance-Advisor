import React from 'react';
import { useLocation } from 'react-router-dom';

export const ContentWrapper = ({ children, className = '' }) => {
  const location = useLocation();
  const isAiPage = location.pathname.startsWith('/ai') || location.pathname.includes('/ai-advisor');

  if (isAiPage) {
    return (
      <main className="flex-1 flex flex-col p-3 sm:p-4 min-w-0 max-w-screen-2xl w-full mx-auto overflow-hidden min-h-0 h-full box-border">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full w-full">
          {children}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-3 sm:p-6 pb-20 md:pb-6 min-w-0 max-w-screen-2xl w-full mx-auto overflow-y-auto custom-scrollbar">
      <div className={`rounded-3xl bg-[#09090B] p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] min-h-full ${className}`}>
        {children}
      </div>
    </main>
  );
};

export default ContentWrapper;
