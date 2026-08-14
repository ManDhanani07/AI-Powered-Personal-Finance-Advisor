import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

export const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea height up to a max limit
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-2xl border border-zinc-800/90 bg-[#12131A] px-3.5 py-2.5 shadow-2xl focus-within:border-cyan-400/80 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all group"
      >
        <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mr-3 hidden sm:flex">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask anything about your finances..."
          className="w-full resize-none bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-50 font-sans py-1 pr-24 max-h-32 custom-scrollbar"
        />

        <div className="absolute right-14 flex items-center space-x-2 text-[10px] font-mono text-slate-500 pointer-events-none hidden sm:flex">
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-slate-400 font-bold flex items-center space-x-1">
            <span>Enter</span>
          </span>
          <span>{text.length}/2000</span>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none ml-2"
          title="Send message"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 text-slate-950 animate-spin" />
          ) : (
            <Send className="h-4 w-4 text-slate-950 stroke-[2.5]" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
