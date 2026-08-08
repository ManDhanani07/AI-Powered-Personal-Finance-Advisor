import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  FileBarChart,
  LineChart,
  Bot,
  User,
  Settings,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

const COMMAND_ITEMS = [
  { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { id: 'transactions', label: 'View Transactions', category: 'Navigation', icon: Receipt, path: ROUTES.TRANSACTIONS },
  { id: 'budgets', label: 'Manage Budgets', category: 'Navigation', icon: PieChart, path: ROUTES.BUDGETS },
  { id: 'goals', label: 'Savings Goals', category: 'Navigation', icon: Target, path: ROUTES.GOALS },
  { id: 'reports', label: 'Reports & Analytics', category: 'Navigation', icon: FileBarChart, path: ROUTES.REPORTS },
  { id: 'forecast', label: 'Financial Forecast', category: 'Navigation', icon: LineChart, path: ROUTES.FORECAST },
  { id: 'advisor', label: 'AI Advisor Chat', category: 'AI Assistant', icon: Bot, path: ROUTES.AI_ADVISOR },
  { id: 'profile', label: 'User Profile', category: 'Account', icon: User, path: ROUTES.PROFILE },
  { id: 'settings', label: 'Account Preferences', category: 'Account', icon: Settings, path: ROUTES.SETTINGS },
  { id: 'new-tx', label: 'Add New Transaction', category: 'Actions', icon: PlusCircle, path: ROUTES.TRANSACTIONS },
  { id: 'new-goal', label: 'Create Savings Goal', category: 'Actions', icon: Sparkles, path: ROUTES.GOALS },
];

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredItems = COMMAND_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-bg-surface border border-border-strong shadow-2xl z-10"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3.5 border-b border-border-subtle">
              <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No matching commands found.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-500/10 text-primary-500 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-bg-elevated'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-500' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 opacity-80">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-bg-elevated border-t border-border-subtle text-[11px] text-slate-400">
              <div className="flex items-center space-x-3">
                <span><kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border-strong">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border-strong">↵</kbd> Select</span>
              </div>
              <span><kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border-strong">ESC</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
