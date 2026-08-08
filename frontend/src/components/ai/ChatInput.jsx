import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export const ChatInput = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask Gemini AI about your spending, Section 80C tax options, or cash flow..."
          className="w-full resize-none rounded-2xl border border-border-strong bg-bg-surface py-3 pl-4 pr-12 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50"
        />
        <div className="absolute right-3 top-3 text-[10px] font-mono text-slate-500 pointer-events-none">
          {text.length}/2000
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:hover:scale-100"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
};

export default ChatInput;
