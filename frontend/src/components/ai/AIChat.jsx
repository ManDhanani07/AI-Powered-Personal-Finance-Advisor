import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth.js';
import aiService from '../../services/aiService.js';
import dashboardService from '../../services/dashboardService.js';

import ConversationSidebar from './ConversationSidebar.jsx';
import ChatWindow from './ChatWindow.jsx';

// Helper: Group raw history items from database into multi-turn sessions
const groupItemsIntoSessions = (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

  // Sort chronological (oldest to newest) to maintain natural message flow
  const sorted = [...rawItems].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  const sessionMap = new Map();

  sorted.forEach((item, idx) => {
    // Group by conversation_id if available, otherwise each legacy item is its own single session
    const sId = item.conversation_id ? item.conversation_id : `session_legacy_${item.id || idx}`;

    if (!sessionMap.has(sId)) {
      sessionMap.set(sId, {
        id: sId,
        conversation_id: item.conversation_id || null,
        title: item.question || 'Financial Chat',
        created_at: item.created_at,
        updated_at: item.created_at,
        messages: [],
      });
    }

    const s = sessionMap.get(sId);
    s.updated_at = item.created_at;
    if (item.question) {
      s.messages.push({
        id: `q-${item.id}`,
        db_id: item.id,
        sender: 'user',
        text: item.question,
        created_at: item.created_at,
      });
    }
    if (item.answer) {
      s.messages.push({
        id: `a-${item.id}`,
        db_id: item.id,
        sender: 'ai',
        text: item.answer,
        created_at: item.created_at,
      });
    }
  });

  // Return sessions sorted newest active first
  return Array.from(sessionMap.values()).sort(
    (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
  );
};

export const AIChat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const prefillHandled = useRef(false);

  // Multi-session state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(() => `session_${Date.now()}`);

  // Real-time PostgreSQL financial context payload
  const [summaryContext, setSummaryContext] = useState(null);

  // Status & Layout states
  const [loading, setLoading] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isOpenLeftMobile, setIsOpenLeftMobile] = useState(false);

  // Reset active session when authenticated user changes
  useEffect(() => {
    setSessions([]);
    setActiveSessionId(`session_${Date.now()}`);
  }, [user?.id, user?.email]);

  // Load User Context & Full Chat History in parallel
  const loadInitialData = useCallback(async () => {
    try {
      const [dashRes, histRes] = await Promise.allSettled([
        dashboardService.getCompleteDashboard(10),
        aiService.getChatHistory(100),
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
        if (Array.isArray(items) && items.length > 0) {
          const grouped = groupItemsIntoSessions(items);
          setSessions(grouped);
          if (grouped.length > 0) {
            setActiveSessionId(grouped[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Error initializing AI Assistant data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData, user?.id]);

  useEffect(() => {
    if (location.state?.prefill && !prefillHandled.current) {
      prefillHandled.current = true;
      handleSendMessage(location.state.prefill);
    }
  }, [location.state]);

  // Get active session messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];

  // Send message in current active multi-turn session
  const handleSendMessage = async (text) => {
    const currentSessionId = activeSessionId || `session_${Date.now()}`;
    if (!activeSessionId) {
      setActiveSessionId(currentSessionId);
    }

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      created_at: new Date().toISOString(),
    };

    // Optimistically update active session
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === currentSessionId);
      if (exists) {
        return prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                updated_at: new Date().toISOString(),
                messages: [...s.messages, userMsg],
              }
            : s
        );
      } else {
        const newSess = {
          id: currentSessionId,
          conversation_id: currentSessionId,
          title: text.length > 40 ? text.slice(0, 40) + '…' : text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [userMsg],
        };
        return [newSess, ...prev];
      }
    });

    setLoading(true);

    try {
      const res = await aiService.sendMessage(text, currentSessionId);
      const data = res?.data?.data ?? res?.data ?? res;

      const aiMsg = {
        id: data?.id || (Date.now() + 1).toString(),
        sender: 'ai',
        text: data?.answer || 'Response generated from live context.',
        created_at: data?.created_at || new Date().toISOString(),
      };

      // Append AI response to the SAME active session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                updated_at: new Date().toISOString(),
                messages: [...s.messages, aiMsg],
              }
            : s
        )
      );

      // If transaction created/updated/deleted, trigger ledger refresh
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
    } catch (err) {
      toast.error(err.message || 'Failed to get AI response.');
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ ${err.message || 'Unable to complete AI query. Please check your network or try again.'}`,
        created_at: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errMsg] }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Start a fresh, clean chat session
  const handleNewSession = () => {
    const newId = `session_${Date.now()}`;
    setActiveSessionId(newId);
    toast.info('Started a new chat session!', { icon: '✨' });
  };

  // Clear all history across all sessions
  const handleClearHistory = async () => {
    try {
      await aiService.clearChatHistory();
      setSessions([]);
      setActiveSessionId(`session_${Date.now()}`);
      toast.success('All conversation history cleared permanently.', { icon: '🧹' });
    } catch (err) {
      toast.error(err.message || 'Failed to clear history.');
    }
  };

  // Delete a single conversation session
  const handleDeleteSession = async (sessionId) => {
    try {
      // If session had a saved conversation_id, delete on backend
      const target = sessions.find((s) => s.id === sessionId);
      if (target?.conversation_id) {
        aiService.deleteConversationSession(target.conversation_id).catch(() => {});
      }

      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          if (updated.length > 0) {
            setActiveSessionId(updated[0].id);
          } else {
            setActiveSessionId(`session_${Date.now()}`);
          }
        }
        return updated;
      });
      toast.info('Conversation session deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete session.');
    }
  };

  // Select existing session from sidebar
  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);
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
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewSession={handleNewSession}
          onClearHistory={handleClearHistory}
          onDeleteSession={handleDeleteSession}
          onSelectSession={handleSelectSession}
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
