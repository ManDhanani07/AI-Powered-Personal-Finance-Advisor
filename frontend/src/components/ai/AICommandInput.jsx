import React, { useState } from 'react';
import { Send, Paperclip, Sparkles, Command } from 'lucide-react';

export const AICommandInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-3xl border border-primary-500/40 bg-bg-surface/90 p-2 shadow-2xl shadow-primary-500/10 backdrop-blur-2xl flex items-center space-x-2"
    >
      {/* Attachment Button */}
      <button
        type="button"
        className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-bg-elevated transition-colors"
        title="Attach Bank Statement / Receipt"
      >
        <Paperclip className="w-4 h-4" />
      </button>

      {/* Slash Command Indicator */}
      <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-xl bg-bg-elevated border border-border-subtle text-[11px] font-bold text-slate-400">
        <Command className="w-3 h-3 text-primary-400" />
        <span>/prompt</span>
      </div>

      {/* Main Text Area Input */}
      <input
        type="text"
        placeholder="Ask AI Copilot anything about your wealth, taxes, or budgets... (Type '/' for commands)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 bg-transparent py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
      />

      {/* Send Submit Trigger Button */}
      <button
        type="submit"
        disabled={!input.trim()}
        className="p-3 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default AICommandInput;
