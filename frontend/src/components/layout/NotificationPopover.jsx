import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  LifeBuoy,
  Users,
  Activity,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/adminService.js';
import { showToast } from '../common/ToastProvider.jsx';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getAlertConfig = (alert) => {
  const t = (alert.title || '').toLowerCase();
  const type = (alert.type || '').toUpperCase();

  if (t.includes('support') || t.includes('ticket')) {
    return {
      icon: LifeBuoy,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    };
  }
  if (type === 'SECURITY' || t.includes('security') || t.includes('audit')) {
    return {
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    };
  }
  if (type === 'ERROR' || t.includes('suspicious') || t.includes('flagged') || t.includes('transaction')) {
    return {
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    };
  }
  if (t.includes('user') || t.includes('onboarding')) {
    return {
      icon: Users,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    };
  }
  return {
    icon: Activity,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  };
};

export const NotificationPopover = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await adminService.getAdminAlerts();
      const payload = res?.data ?? res;
      if (payload) {
        setAlerts(payload.items || []);
        setUnreadCount(payload.unread_count ?? (payload.items || []).filter((i) => !i.is_read).length);
      }
    } catch (err) {
      console.warn('Failed to load admin notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      if (!prev) fetchAlerts();
      return !prev;
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await adminService.markAllAdminAlertsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadCount(0);
      showToast.success('All alerts marked as read.');
    } catch {
      showToast.error('Failed to mark alerts as read.');
    }
  };

  const handleClearRead = async () => {
    try {
      await adminService.clearAdminAlerts();
      setAlerts((prev) => prev.filter((a) => !a.is_read));
      showToast.success('Read alerts cleared.');
    } catch {
      showToast.error('Failed to clear read alerts.');
    }
  };

  const handleClickAlert = async (alert) => {
    try {
      if (!alert.is_read) {
        await adminService.markAdminAlertRead(alert.id);
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, is_read: true } : a))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // Continue navigation even if read-state update fails
    }

    setIsOpen(false);
    if (alert.action_url) {
      navigate(alert.action_url);
    }
  };

  const handleDeleteAlert = async (e, alertId) => {
    e.stopPropagation();
    try {
      await adminService.deleteAdminAlert(alertId);
      const target = alerts.find((a) => a.id === alertId);
      if (target && !target.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      showToast.error('Failed to dismiss alert.');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white transition-colors"
        aria-label="Admin Notifications"
        title="Admin Notifications & System Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-80 sm:w-[420px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl z-50 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60">
              <div className="flex items-center space-x-2.5">
                <span className="font-bold text-sm text-white font-outfit">Platform Alerts</span>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {unreadCount} pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    All clear
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                {alerts.some((a) => a.is_read) && (
                  <button
                    onClick={handleClearRead}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Clear read alerts"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Alerts Feed */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-800/60 scrollbar-thin">
              {alerts.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">All Systems Operational</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                    No administrative anomalies, unresolved tickets, or flagged transactions requiring review.
                  </p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const cfg = getAlertConfig(alert);
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={alert.id}
                      onClick={() => handleClickAlert(alert)}
                      className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer group ${
                        !alert.is_read
                          ? 'bg-zinc-900/50 hover:bg-zinc-900/80'
                          : 'hover:bg-zinc-900/40 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`p-2 rounded-xl flex-shrink-0 border ${cfg.bgColor}`}>
                        <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            {!alert.is_read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
                            )}
                            <h4 className="text-xs font-bold text-white truncate font-outfit">
                              {alert.title}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                            {formatTimeAgo(alert.created_at)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {alert.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                            <span>{alert.action_label || 'Investigate'}</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteAlert(e, alert.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-[11px] text-slate-500 px-4">
                <span>Real-time platform monitor</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {alerts.length} total alert{alerts.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPopover;
