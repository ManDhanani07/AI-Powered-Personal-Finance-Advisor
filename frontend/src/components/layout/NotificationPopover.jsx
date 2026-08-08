import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Budget Warning',
    message: 'Dining Out budget reached 85% of monthly allocation.',
    time: '10m ago',
    unread: true,
    type: 'warning',
    icon: AlertCircle,
  },
  {
    id: 2,
    title: 'Goal Achieved! 🎉',
    message: 'Emergency Fund goal has reached 100% of target!',
    time: '2h ago',
    unread: true,
    type: 'success',
    icon: Target,
  },
  {
    id: 3,
    title: 'Income Logged',
    message: 'Salary payment of ₹1,50,000 received.',
    time: '1d ago',
    unread: false,
    type: 'info',
    icon: TrendingUp,
  },
];

export const NotificationPopover = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-bg-elevated transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-bg-surface border border-border-strong shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-elevated/50">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center space-x-1 text-primary-500 hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications. You're all caught up!
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start space-x-3 transition-colors ${
                        n.unread ? 'bg-primary-500/5' : 'hover:bg-bg-elevated/50'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 ${
                          n.type === 'warning'
                            ? 'bg-amber-500/10 text-amber-500'
                            : n.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPopover;
