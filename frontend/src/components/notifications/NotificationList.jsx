import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationCard from './NotificationCard.jsx';
import EmptyNotificationState from './EmptyNotificationState.jsx';

export const NotificationList = ({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onDelete,
  page = 1,
  totalPages = 1,
  onPageChange,
  unreadCount = 0,
}) => {
  if (!notifications || notifications.length === 0) {
    return <EmptyNotificationState />;
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-white">{notifications.length}</strong> notification(s)
          {unreadCount > 0 && <span className="text-primary-400 font-bold ml-1 font-sans">({unreadCount} unread)</span>}
        </span>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-border-subtle hover:border-border-strong cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Animated Card Trajectory */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NotificationCard
                notification={notif}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle px-2">
          <span className="text-xs text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-slate-800 border border-border-subtle text-slate-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-800 border border-border-subtle text-slate-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
