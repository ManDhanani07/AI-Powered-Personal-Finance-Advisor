import React from 'react';
import { Bell, CheckCheck, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotificationDropdown = ({
  unreadCount = 0,
  latestNotifications = [],
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2.5 w-80 sm:w-[360px] bg-bg-surface/95 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-2xl z-[9999] overflow-hidden"
      style={{ minWidth: '300px', maxWidth: 'calc(100vw - 24px)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-card/40">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-primary-400 shrink-0" />
          <h3 className="font-bold text-sm text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-500/20 text-primary-400 border border-primary-500/30 leading-none">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center space-x-1 font-bold transition-colors shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Read All</span>
          </button>
        )}
      </div>

      {/* List Body */}
      <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle/50 scrollbar-thin">
        {latestNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Sparkles className="w-7 h-7 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-slate-300">No new notifications.</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              PostgreSQL engine is monitoring your finances.
            </p>
          </div>
        ) : (
          latestNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 transition-colors flex items-start justify-between gap-3 ${
                !notif.is_read ? 'bg-primary-500/5' : 'hover:bg-bg-elevated/40'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      notif.priority === 'CRITICAL'
                        ? 'bg-rose-500'
                        : notif.priority === 'HIGH'
                        ? 'bg-amber-500'
                        : 'bg-primary-500'
                    }`}
                  />
                  <h4 className="text-xs font-bold text-white truncate leading-tight">
                    {notif.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed pl-3.5">
                  {notif.message}
                </p>
                <span className="text-[9px] text-slate-500 font-mono block pl-3.5">
                  {new Date(notif.created_at).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              {!notif.is_read && onMarkRead && (
                <button
                  onClick={() => onMarkRead(notif.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 shrink-0 transition-colors"
                  title="Mark read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default NotificationDropdown;
