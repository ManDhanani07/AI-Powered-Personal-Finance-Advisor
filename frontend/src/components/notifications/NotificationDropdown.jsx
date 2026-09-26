import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  Megaphone,
  AlertTriangle,
  ShieldAlert,
  Info,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getNoticeMeta = (notif) => {
  const type = (notif.notification_type || '').toUpperCase();
  const mod = (notif.related_module || '').toUpperCase();
  const cat = (notif.category || '').toUpperCase();
  const priority = (notif.priority || '').toUpperCase();

  if (type.includes('BROADCAST') || mod === 'PLATFORM_BROADCAST') {
    return {
      label: 'Platform Announcement',
      icon: Megaphone,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      dotColor: priority === 'CRITICAL' ? 'bg-rose-500' : 'bg-indigo-400',
    };
  }
  if (type.includes('ADMIN') || mod === 'ADMIN') {
    return {
      label: priority === 'CRITICAL' ? 'Admin Warning' : 'Admin Notice',
      icon: priority === 'CRITICAL' ? ShieldAlert : AlertTriangle,
      badgeColor: priority === 'CRITICAL' 
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
        : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: priority === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400',
    };
  }
  if (cat === 'SECURITY' || priority === 'CRITICAL') {
    return {
      label: 'Security Alert',
      icon: ShieldAlert,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-500',
    };
  }
  if (priority === 'HIGH') {
    return {
      label: 'Important',
      icon: AlertTriangle,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400',
    };
  }
  return {
    label: null,
    icon: Bell,
    badgeColor: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    dotColor: 'bg-emerald-400',
  };
};

export const NotificationDropdown = ({
  unreadCount = 0,
  latestNotifications = [],
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedNotif, setSelectedNotif] = useState(null);

  const toggleExpand = (e, notifId, isUnread) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(notifId)) {
        next.delete(notifId);
      } else {
        next.add(notifId);
        // Automatically mark as read when expanded
        if (isUnread && onMarkRead) {
          onMarkRead(notifId);
        }
      }
      return next;
    });
  };

  const handleOpenDetail = (e, notif) => {
    e.stopPropagation();
    setSelectedNotif(notif);
    if (!notif.is_read && onMarkRead) {
      onMarkRead(notif.id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 mt-2.5 w-[330px] sm:w-[400px] bg-bg-surface/95 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-2xl z-[9999] overflow-hidden"
        style={{ minWidth: '320px', maxWidth: 'calc(100vw - 24px)' }}
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
        <div className="max-h-[460px] overflow-y-auto divide-y divide-border-subtle/50 scrollbar-thin">
          {latestNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Sparkles className="w-7 h-7 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No new notifications.</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Platform notifications and alerts will appear here.
              </p>
            </div>
          ) : (
            latestNotifications.map((notif) => {
              const meta = getNoticeMeta(notif);
              const isExpanded = expandedIds.has(notif.id);
              const isLongMessage = (notif.message || '').length > 70;

              return (
                <div
                  key={notif.id}
                  onClick={(e) => toggleExpand(e, notif.id, !notif.is_read)}
                  className={`px-4 py-3.5 transition-colors cursor-pointer group ${
                    !notif.is_read ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'hover:bg-bg-elevated/40'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    {/* Header Row: Dot + Badge + Title */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${meta.dotColor}`}
                        />
                        <h4 className="text-xs font-bold text-white leading-tight font-outfit truncate">
                          {notif.title}
                        </h4>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Expand to detail modal */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenDetail(e, notif)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="View full notice in popup"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark read button */}
                        {!notif.is_read && onMarkRead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkRead(notif.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Announcement Badge if Broadcast or Admin Warning */}
                    {meta.label && (
                      <div className="pl-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeColor}`}
                        >
                          <meta.icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                      </div>
                    )}

                    {/* Message Body (Collapsible or Full) */}
                    <div className="pl-4">
                      {isExpanded ? (
                        <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed break-words shadow-inner">
                          {notif.message}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed break-words">
                          {notif.message}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Timestamp & Toggle expand */}
                    <div className="flex items-center justify-between pl-4 pt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(notif.created_at).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>

                      {isLongMessage && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(e, notif.id, !notif.is_read)}
                          className="text-[11px] font-bold text-primary-400 hover:text-primary-300 flex items-center space-x-0.5 transition-colors"
                        >
                          <span>{isExpanded ? 'Show less' : 'Read full message'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Full Detail Modal Popup */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  {getNoticeMeta(selectedNotif).label && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        getNoticeMeta(selectedNotif).badgeColor
                      }`}
                    >
                      {React.createElement(getNoticeMeta(selectedNotif).icon, { className: 'w-3 h-3' })}
                      <span>{getNoticeMeta(selectedNotif).label}</span>
                    </span>
                  )}
                  <h3 className="text-base font-black text-white font-outfit leading-snug">
                    {selectedNotif.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {new Date(selectedNotif.created_at).toLocaleString('en-IN', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedNotif(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Message Content */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words max-h-72 overflow-y-auto">
                {selectedNotif.message}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setSelectedNotif(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationDropdown;
