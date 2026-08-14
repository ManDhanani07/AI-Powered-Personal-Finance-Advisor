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
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-white font-semibold">{notifications.length}</strong> notification(s)
          {unreadCount > 0 && <span className="text-indigo-400 font-semibold ml-1">({unreadCount} unread)</span>}
        </span>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-zinc-800 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
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
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 px-1 text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{page}</strong> of {totalPages}
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
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
