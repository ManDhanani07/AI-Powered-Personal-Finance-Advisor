import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import aiService from '../../services/aiService.js';
import dashboardService from '../../services/dashboardService.js';

import ConversationSidebar from './ConversationSidebar.jsx';
import ChatWindow from './ChatWindow.jsx';

export const AIChat = () => {
  const location = useLocation();
  const prefillHandled = useRef(false);

  // Active continuous conversation thread
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ai_active_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Past conversation history items from PostgreSQL
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ai_history_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Real-time PostgreSQL financial context payload
  const [summaryContext, setSummaryContext] = useState(null);

  // Status & Layout states
  const [loading, setLoading] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isOpenLeftMobile, setIsOpenLeftMobile] = useState(false);

  // Save active session to sessionStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem('ai_active_messages', JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Failed to sync chat messages to sessionStorage', e);
    }
  }, [messages]);

  // Helper to build full continuous message thread from raw history items
  const buildFullThreadFromItems = (items) => {
    const thread = [];
    const sorted = [...items].reverse();
    sorted.forEach((item) => {
      thread.push({
        id: `q-${item.id}`,
        db_id: item.id,
        sender: 'user',
        text: item.question,
        created_at: item.created_at,
      });
      thread.push({
        id: `a-${item.id}`,
        db_id: item.id,
        sender: 'ai',
        text: item.answer,
        created_at: item.created_at,
      });
    });
    return thread;
  };

  // Load User Context & Full Chat History in parallel
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
        const items =
          raw?.data?.items ??
          raw?.items ??
          (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
        if (Array.isArray(items)) {
          setHistoryItems(items);
          sessionStorage.setItem('ai_history_cache', JSON.stringify(items));

          const hasSavedSession = Boolean(sessionStorage.getItem('ai_active_messages'));
          if (!hasSavedSession && items.length > 0) {
            const fullThread = buildFullThreadFromItems(items);
            setMessages(fullThread);
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
        text: data?.answer || 'Response generated from live context.',
        created_at: data?.created_at || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If transaction created/updated, trigger ledger refresh
      if (
        aiMsg.text.includes('Transaction Created') ||
        aiMsg.text.includes('Transaction Deleted') ||
        aiMsg.text.includes('Transaction Updated') ||
        aiMsg.text.includes('Saved to Ledger') ||
        aiMsg.text.includes('Recorded Successfully')
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
      const historyList =
        rawHist?.data?.items ??
        rawHist?.items ??
        (Array.isArray(rawHist?.data) ? rawHist.data : Array.isArray(rawHist) ? rawHist : []);
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

  // Reset current session
  const handleNewSession = () => {
    try {
      sessionStorage.removeItem('ai_active_messages');
    } catch (e) {
      console.warn('Failed to clear sessionStorage', e);
    }
    setMessages([]);
    toast.info('New chat session started!', { icon: '✨' });
  };

  // Clear all history
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

  // Delete single history item
  const handleDeleteItem = (itemId) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info('Conversation removed from list.');
  };

  // Select history item to view/scroll
  const handleSelectHistoryItem = (item) => {
    let currentThread = messages;

    if (currentThread.length === 0 && historyItems.length > 0) {
      currentThread = buildFullThreadFromItems(historyItems);
      setMessages(currentThread);
    }

    setTimeout(() => {
      const targetEl =
        document.getElementById(`msg-q-${item.id}`) ||
        document.getElementById(`msg-a-${item.id}`) ||
        document.getElementById(`msg-${item.id}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="flex-1 h-full w-full rounded-2xl border border-zinc-800/80 bg-[#07070A] shadow-2xl flex flex-col overflow-hidden relative backdrop-blur-2xl min-h-0">
      {/* Ambient Glow Effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />

      {/* Main 2-Column Layout Canvas */}
      <div className="flex-1 flex flex-row items-stretch overflow-hidden z-10 min-h-0 h-full">
        {/* COLUMN 1: Left Conversation Sidebar */}
        <ConversationSidebar
          historyItems={historyItems}
          activeMessageCount={messages.length}
          onNewSession={handleNewSession}
          onClearHistory={handleClearHistory}
          onDeleteItem={handleDeleteItem}
          onSelectHistoryItem={handleSelectHistoryItem}
          summaryContext={summaryContext}
          loading={loading}
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed((prev) => !prev)}
          isOpenMobile={isOpenLeftMobile}
          onCloseMobile={() => setIsOpenLeftMobile(false)}
        />

        {/* COLUMN 2: Main Conversation Canvas */}
        <div className="flex-1 flex flex-col bg-transparent relative overflow-hidden min-h-0 h-full">
          <ChatWindow
            messages={messages}
            loading={loading}
            summaryContext={summaryContext}
            onSelectQuestion={handleSendMessage}
            onSendMessage={handleSendMessage}
            onToggleLeftSidebar={() => {
              if (window.innerWidth < 1024) {
                setIsOpenLeftMobile((prev) => !prev);
              } else {
                setIsLeftSidebarCollapsed((prev) => !prev);
              }
            }}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
          />
        </div>
      </div>
    </div>
  );
};

export default AIChat;
