import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3 p-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg">
        <Bot className="h-4 w-4" />
      </div>

      <div className="rounded-2xl rounded-tl-none border border-border-subtle bg-bg-surface px-4 py-3 shadow-glass flex items-center space-x-2">
        <span className="text-xs font-semibold text-primary-400">Gemini AI analyzing financial context</span>
        <div className="flex space-x-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
