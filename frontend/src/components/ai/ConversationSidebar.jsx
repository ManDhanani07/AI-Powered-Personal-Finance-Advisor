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
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export const ConversationSidebar = ({
  historyItems = [],
  activeMessageCount = 0,
  onNewSession,
  onClearHistory,
  onDeleteItem,
  onSelectHistoryItem,
  summaryContext,
  loading,
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Filter history items by search query
  const filteredHistory = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.question?.toLowerCase().includes(q) ||
      item.answer?.toLowerCase().includes(q)
    );
  });

  const SidebarContent = (
    <div className="flex flex-col h-full min-h-0 bg-[#0C0D10] text-slate-100 font-sans border-r border-zinc-800/80 p-3.5 space-y-3.5 overflow-hidden">
      {/* Top Prominent ChatGPT-Style AI Logo Header */}
      <div className="flex items-center justify-between shrink-0 border-b border-zinc-800/80 pb-3 pt-1">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-40 blur-sm group-hover:opacity-70 transition-opacity" />
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
          </div>

          {!isCollapsed && (
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
          )}
        </div>

        {/* Collapse Button for Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-xl bg-[#14151B] hover:bg-zinc-800 border border-zinc-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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

      {/* Primary Action Button: New Chat */}
      <button
        onClick={onNewSession}
        disabled={loading}
        className={`w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-center space-x-2'
        } shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer disabled:opacity-50 font-outfit shrink-0 active:scale-[0.98]`}
        title="Start New Chat Session"
      >
        <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
        {!isCollapsed && <span>New Chat</span>}
      </button>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="relative shrink-0">
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
        <div className="flex items-center justify-between px-1 shrink-0 pt-0.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recent Conversations ({filteredHistory.length})</span>
          </p>

          {historyItems.length > 0 && (
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
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar overscroll-contain scroll-smooth">
        {filteredHistory.length === 0 ? (
          !isCollapsed && (
            <div className="rounded-xl border border-zinc-800/60 bg-[#121216]/50 p-3 text-center">
              <p className="text-[11px] text-slate-400 italic">
                {searchQuery ? 'No matching conversations found.' : 'No recent conversations recorded yet.'}
              </p>
            </div>
          )
        ) : (
          filteredHistory.map((item, idx) => {
            const titleText = item.question || 'Financial Conversation';
            const dateStr = item.created_at ? formatDate(item.created_at) : '';

            if (isCollapsed) {
              return (
                <button
                  key={item.id || idx}
                  onClick={() => onSelectHistoryItem(item)}
                  className="w-full p-2 rounded-xl bg-[#12131A] hover:bg-zinc-800 border border-zinc-800 text-slate-300 flex justify-center transition-all cursor-pointer"
                  title={titleText}
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                </button>
              );
            }

            return (
              <div
                key={item.id || idx}
                className="group relative flex items-center rounded-xl bg-[#12131A] hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-emerald-500/40 p-2.5 transition-all text-xs cursor-pointer shadow-sm overflow-hidden"
                onClick={() => onSelectHistoryItem(item)}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-200 group-hover:text-white font-medium text-[11px] leading-tight">
                      {titleText}
                    </p>
                    {dateStr && (
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{dateStr}</p>
                    )}
                  </div>
                </div>

                {onDeleteItem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
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

      {/* Confirmation Modal for Clearing History */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
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
        className={`hidden lg:flex flex-col h-full min-h-0 shrink-0 transition-all duration-300 ${
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
