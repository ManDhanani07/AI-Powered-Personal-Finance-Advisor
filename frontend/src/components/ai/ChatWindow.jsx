import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import EmptyChatState from './EmptyChatState.jsx';
import SuggestedQuestions from './SuggestedQuestions.jsx';

export const ChatWindow = ({
  messages = [],
  loading = false,
  summaryContext,
  onSelectQuestion,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden bg-bg-base/40 relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <EmptyChatState
              summaryContext={summaryContext}
              onSelectQuestion={onSelectQuestion}
            />
            <SuggestedQuestions
              onSelectQuestion={onSelectQuestion}
              disabled={loading}
            />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} message={msg} />
            ))}
          </AnimatePresence>
        )}

        {loading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
