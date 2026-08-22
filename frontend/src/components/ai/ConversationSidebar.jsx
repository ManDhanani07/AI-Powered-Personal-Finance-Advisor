import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  MessagesSquare,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export const ConversationSidebar = ({
  sessions = [],
  activeSessionId,
  onNewSession,
  onClearHistory,
  onDeleteSession,
  onSelectSession,
  summaryContext,
  loading,
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Filter sessions by search query (match title or any message inside session)
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (s.title?.toLowerCase().includes(q)) return true;
    return s.messages?.some(
      (m) => m.text?.toLowerCase().includes(q)
    );
  });

  const SidebarContent = (
    <div className={`flex flex-col h-full min-h-0 bg-[#0C0D10] text-slate-100 font-sans border-r border-zinc-800/80 ${isCollapsed ? 'p-2.5 items-center space-y-3' : 'p-4 space-y-3.5'} overflow-hidden`}>
      {/* Top Header */}
      {isCollapsed ? (
        <div className="flex flex-col items-center space-y-2.5 shrink-0 border-b border-zinc-800/80 pb-3 w-full">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          {/* Prominent Expand Button when Collapsed */}
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-xl bg-[#14151B] hover:bg-cyan-500/20 border border-zinc-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between shrink-0 border-b border-zinc-800/80 pb-3.5 pt-1.5 w-full">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-black text-white font-outfit tracking-tight truncate">
                  AI Advisor
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black text-emerald-400 font-outfit shrink-0">
                  v2.5 Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate font-sans">
                Financial Copilot
              </p>
            </div>
          </div>

          {/* Collapse Button for Desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl bg-[#14151B] hover:bg-zinc-800 border border-zinc-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Close Button for Mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl bg-zinc-800 text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Primary Action Button: New Chat */}
      {isCollapsed ? (
        <button
          onClick={onNewSession}
          disabled={loading}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
          title="Start New Chat"
        >
          <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
        </button>
      ) : (
        <button
          onClick={onNewSession}
          disabled={loading}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer disabled:opacity-50 font-outfit shrink-0 active:scale-[0.98]"
          title="Start New Chat Session"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>New Chat</span>
        </button>
      )}

      {/* Search Bar (Expanded Only) */}
      {!isCollapsed && (
        <div className="relative shrink-0 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#12131A] border border-zinc-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Recent Conversations List Header */}
      {!isCollapsed && (
        <div className="flex items-center justify-between px-1 shrink-0 pt-0.5 w-full">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center space-x-1.5">
            <MessagesSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recent Chats ({filteredSessions.length})</span>
          </p>

          {sessions.length > 0 && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={loading}
              className="p-1 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer text-[10px] font-bold flex items-center space-x-1"
              title="Clear All History"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      )}

      {/* Scrollable Conversation List Container */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${isCollapsed ? 'w-full space-y-2 flex flex-col items-center pr-0' : 'space-y-1.5 pr-1 w-full'} custom-scrollbar overscroll-contain scroll-smooth`}>
        {filteredSessions.length === 0 ? (
          !isCollapsed && (
            <div className="rounded-xl border border-zinc-800/60 bg-[#121216]/50 p-3 text-center">
              <p className="text-[11px] text-slate-400 italic">
                {searchQuery ? 'No matching conversations found.' : 'No recent chats recorded yet.'}
              </p>
            </div>
          )
        ) : (
          filteredSessions.map((session, idx) => {
            const isActive = session.id === activeSessionId;
            const titleText = session.title || 'Financial Conversation';
            const dateStr = session.updated_at || session.created_at ? formatDate(session.updated_at || session.created_at) : '';
            
            // Count messages that AI gave in reply / answer (each AI answer = 1 message turn)
            const aiAnswersCount = session.messages?.filter((m) => m.sender === 'ai').length ||
              (session.messages?.length > 0 ? Math.ceil(session.messages.length / 2) : 0);
            const msgLabel = `${aiAnswersCount} ${aiAnswersCount === 1 ? 'msg' : 'msgs'}`;

            if (isCollapsed) {
              return (
                <button
                  key={session.id || idx}
                  onClick={() => onSelectSession(session)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-[#12131A] hover:bg-zinc-800 border-zinc-800 text-slate-400 hover:text-white'
                  }`}
                  title={`${titleText} (${msgLabel})`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  )}
                </button>
              );
            }

            return (
              <div
                key={session.id || idx}
                className={`group relative flex items-center rounded-xl p-2.5 transition-all text-xs cursor-pointer shadow-sm overflow-hidden border ${
                  isActive
                    ? 'bg-[#161922] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white'
                    : 'bg-[#12131A] hover:bg-zinc-800/80 border-zinc-800/80 hover:border-zinc-700 text-slate-300'
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-zinc-600 group-hover:bg-cyan-400'
                    } transition-colors`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium text-[11px] leading-tight ${isActive ? 'text-white font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                      {titleText}
                    </p>
                    <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-mono mt-1">
                      {aiAnswersCount > 0 && <span>{msgLabel}</span>}
                      {dateStr && <span>• {dateStr}</span>}
                    </div>
                  </div>
                </div>

                {onDeleteSession && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0 cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Clearing All History */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center space-x-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-base font-black text-white font-outfit">Clear Conversation History</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Are you sure you want to delete all past Gemini AI conversation records? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    onClearHistory();
                  }}
                  className="px-4.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Delete History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop Column */}
      <aside
        className={`hidden lg:flex flex-col h-full min-h-0 shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="lg:hidden fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xs h-full bg-[#0C0D10] shadow-2xl"
            >
              {SidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConversationSidebar;
