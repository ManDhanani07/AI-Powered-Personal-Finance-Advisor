import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Bot,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const ConversationSidebar = ({
  historyItems = [],
  onNewSession,
  onClearHistory,
  onSelectHistoryItem,
  summaryContext,
  loading,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const overview = summaryContext?.overview;
  const income = Number(overview?.monthly_income ?? overview?.total_income ?? 0);
  const expense = Number(overview?.monthly_expenses ?? overview?.total_expenses ?? 0);
  const surplus = Number(overview?.net_savings ?? overview?.net_surplus ?? (income - expense));

  return (
    <div className="w-full lg:w-80 border-r border-border-subtle bg-bg-surface p-4 flex flex-col justify-between shrink-0 space-y-4">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white font-outfit">
              Gemini AI Financial Advisor
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              v1.5 Flash • PostgreSQL Sync
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onNewSession}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New AI Session</span>
          </button>

          {historyItems.length > 0 && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Live Context Summary Card */}
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Ledger Context</span>
            <span className="text-emerald-400 font-mono">Live</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Income:</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Expenses:</span>
              <span className="font-extrabold text-rose-400 font-mono">{formatCurrency(expense)}</span>
            </div>
            <div className="flex justify-between border-t border-border-subtle pt-1">
              <span className="text-slate-400">Net Surplus:</span>
              <span className="font-extrabold text-indigo-400 font-mono">{formatCurrency(surplus)}</span>
            </div>
          </div>
        </div>

        {/* Conversation History List */}
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 font-outfit">
            Recent Questions ({historyItems.length})
          </p>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {historyItems.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic px-1 py-2">
                No past questions recorded yet.
              </p>
            ) : (
              historyItems.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => onSelectHistoryItem(item)}
                  className="w-full p-2.5 rounded-xl bg-bg-elevated/50 hover:bg-bg-elevated border border-border-subtle hover:border-primary-500/30 text-left transition-all text-xs group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span className="truncate text-slate-300 group-hover:text-white font-medium">
                      {item.question}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-border-strong bg-bg-surface p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center space-x-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-base font-bold text-white font-outfit">Clear Chat History</h4>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to delete all past Gemini AI conversation records from PostgreSQL? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3.5 py-2 rounded-xl bg-bg-elevated hover:bg-border-strong text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    onClearHistory();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer"
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
};

export default ConversationSidebar;
