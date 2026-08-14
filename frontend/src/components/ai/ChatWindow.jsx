import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PanelLeft } from 'lucide-react';
import ChatMessage from './ChatMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import EmptyChatState from './EmptyChatState.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';
import ChatInput from './ChatInput.jsx';

export const ChatWindow = ({
  messages = [],
  loading = false,
  summaryContext,
  onSelectQuestion,
  onSendMessage,
  onToggleLeftSidebar,
  isLeftSidebarCollapsed,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#07070A]/60 relative min-h-0 h-full min-w-0">
      {/* Center Chat Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80 bg-[#0B0C10] shrink-0 z-20">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={onToggleLeftSidebar}
            className="p-1.5 rounded-xl bg-[#14151B] hover:bg-zinc-800 border border-zinc-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1 text-xs font-medium shrink-0"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline text-[11px] font-outfit">Sidebar</span>
          </button>

          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <h2 className="text-xs font-black text-white font-outfit truncate">
              Gemini AI Financial Copilot
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-extrabold text-emerald-400 font-outfit hidden md:inline-block shrink-0">
              v2.5 Pro
            </span>
          </div>
        </div>
      </div>

      {/* Main Scrollable Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0 min-w-0 custom-scrollbar overscroll-contain scroll-smooth flex flex-col">
        {messages.length === 0 ? (
          <div className="my-auto space-y-3 py-2">
            <EmptyChatState />
            <SuggestedQuestions
              onSelectQuestion={onSelectQuestion}
              disabled={loading}
              compact={false}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <ChatMessage key={msg.id || index} message={msg} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {loading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Flush Sticky Input Section (mt-auto locks to absolute bottom) */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#0B0C10] shrink-0 mt-auto space-y-2 min-w-0 z-20">
        {messages.length > 0 && (
          <SuggestedQuestions
            onSelectQuestion={onSelectQuestion}
            disabled={loading}
            compact={true}
          />
        )}

        <ChatInput onSendMessage={onSendMessage} disabled={loading} />
      </div>
    </div>
  );
};

export default ChatWindow;
