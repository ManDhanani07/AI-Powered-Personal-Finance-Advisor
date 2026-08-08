import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import aiService from '../../services/aiService.js';
import dashboardService from '../../services/dashboardService.js';

import ConversationSidebar from './ConversationSidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import ChatInput from './ChatInput.jsx';

export const AIChat = () => {
  const location = useLocation();
  const prefillHandled = useRef(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ai_active_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ai_history_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [summaryContext, setSummaryContext] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem('ai_active_messages', JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Failed to sync chat messages to sessionStorage', e);
    }
  }, [messages]);

  // Load User Context & History from PostgreSQL
  const loadInitialData = useCallback(async () => {
    try {
      const [dashRes, histRes] = await Promise.allSettled([
        dashboardService.getCompleteDashboard(10),
        aiService.getChatHistory(50),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        const payload = dashRes.value?.data?.data ?? dashRes.value?.data ?? dashRes.value;
        setSummaryContext(payload);
      }

      if (histRes.status === 'fulfilled' && histRes.value) {
        const raw = histRes.value?.data ?? histRes.value;
        const items = raw?.data?.items ?? raw?.items ?? (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
        if (Array.isArray(items)) {
          setHistoryItems(items);
          sessionStorage.setItem('ai_history_cache', JSON.stringify(items));
          const hasSavedSession = Boolean(sessionStorage.getItem('ai_active_messages'));
          if (!hasSavedSession && items.length > 0) {
            const restored = [];
            const sorted = [...items].reverse();
            sorted.forEach((item) => {
              restored.push({
                id: `q-${item.id}`,
                sender: 'user',
                text: item.question,
                created_at: item.created_at,
              });
              restored.push({
                id: `a-${item.id}`,
                sender: 'ai',
                text: item.answer,
                created_at: item.created_at,
              });
            });
            setMessages(restored);
          }
        }
      }
    } catch (err) {
      console.warn('Error initializing AI Assistant data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (location.state?.prefill && !prefillHandled.current) {
      prefillHandled.current = true;
      handleSendMessage(location.state.prefill);
    }
  }, [location.state]);

  // Send message to Gemini AI API
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiService.sendMessage(text);
      const data = res?.data?.data ?? res?.data ?? res;

      const aiMsg = {
        id: data?.id || (Date.now() + 1).toString(),
        sender: 'ai',
        text: data?.answer || 'Response generated from live PostgreSQL context.',
        created_at: data?.created_at || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      if (
        aiMsg.text.includes('Transaction Created') ||
        aiMsg.text.includes('Transaction Deleted') ||
        aiMsg.text.includes('Transaction Updated') ||
        aiMsg.text.includes('Saved to PostgreSQL')
      ) {
        window.dispatchEvent(new CustomEvent('ledger_updated'));
        dashboardService.getCompleteDashboard(10).then((dashRes) => {
          const payload = dashRes?.data?.data ?? dashRes?.data ?? dashRes;
          setSummaryContext(payload);
        }).catch(() => {});
      }

      // Refresh sidebar history list
      const histRes = await aiService.getChatHistory(50);
      const rawHist = histRes?.data ?? histRes;
      const historyList = rawHist?.data?.items ?? rawHist?.items ?? (Array.isArray(rawHist?.data) ? rawHist.data : Array.isArray(rawHist) ? rawHist : []);
      if (Array.isArray(historyList)) {
        setHistoryItems(historyList);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to get AI response.');
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ ${err.message || 'Unable to complete AI query. Please check your network or try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Reset current session chat view
  const handleNewSession = () => {
    try {
      sessionStorage.removeItem('ai_active_messages');
    } catch (e) {
      console.warn('Failed to clear sessionStorage', e);
    }
    setMessages([]);
    toast.info('New chat session started!', { icon: '✨' });
  };

  // Clear all history from PostgreSQL
  const handleClearHistory = async () => {
    try {
      await aiService.clearChatHistory();
      sessionStorage.removeItem('ai_active_messages');
      setHistoryItems([]);
      setMessages([]);
      toast.success('Chat history cleared permanently.', { icon: '🧹' });
    } catch (err) {
      toast.error(err.message || 'Failed to clear history.');
    }
  };

  // Load past history item into chat view
  const handleSelectHistoryItem = (item) => {
    setMessages([
      {
        id: `h-q-${item.id}`,
        sender: 'user',
        text: item.question,
        created_at: item.created_at,
      },
      {
        id: `h-a-${item.id}`,
        sender: 'ai',
        text: item.answer,
        created_at: item.created_at,
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-180px)] rounded-3xl border border-border-subtle bg-bg-surface overflow-hidden flex flex-col lg:flex-row shadow-2xl">
      {/* Left Sidebar */}
      <ConversationSidebar
        historyItems={historyItems}
        onNewSession={handleNewSession}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        summaryContext={summaryContext}
        loading={loading}
      />

      {/* Main Conversation Center */}
      <div className="flex-1 flex flex-col justify-between bg-bg-base/40 relative">
        <ChatWindow
          messages={messages}
          loading={loading}
          summaryContext={summaryContext}
          onSelectQuestion={handleSendMessage}
        />

        {/* Bottom Command Prompt */}
        <div className="p-4 border-t border-border-subtle bg-bg-surface/80 backdrop-blur-md">
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default AIChat;
