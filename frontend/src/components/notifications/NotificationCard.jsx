import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Check,
  Trash2,
  PieChart,
  Target,
  TrendingUp,
  HeartPulse,
  Sparkles,
  Zap,
} from 'lucide-react';
import { showToast } from '../common/ToastProvider.jsx';

const PRIORITY_STYLES = {
  CRITICAL: {
    bg: 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50',
    iconBg: 'bg-rose-500/20 text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: AlertTriangle,
  },
  HIGH: {
    bg: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50',
    iconBg: 'bg-amber-500/20 text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: AlertCircle,
  },
  MEDIUM: {
    bg: 'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/50',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    icon: Info,
  },
  LOW: {
    bg: 'bg-slate-800/40 border-border-subtle hover:border-border-strong',
    iconBg: 'bg-slate-700/50 text-slate-300',
    badge: 'bg-slate-700/50 text-slate-400 border-slate-600/40',
    icon: CheckCircle2,
  },
};

const CATEGORY_ICONS = {
  BUDGET: PieChart,
  GOAL: Target,
  TRANSACTION: TrendingUp,
  HEALTH: HeartPulse,
  FORECAST: Sparkles,
  AI: Zap,
};

export const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  if (!notification) return null;

  const priorityKey = (notification.priority || 'LOW').toUpperCase();
  const style = PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.LOW;
  const CategoryIcon = CATEGORY_ICONS[notification.category?.toUpperCase()] || style.icon;

  const formattedDate = notification.created_at
    ? new Date(notification.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Just now';

  return (
    <div
      className={`p-5 rounded-3xl backdrop-blur-xl border transition-all duration-200 shadow-md relative overflow-hidden group ${style.bg} ${
        !notification.is_read ? 'shadow-primary-500/5 ring-1 ring-primary-500/20' : 'opacity-85'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Icon & Content */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <div className={`p-3 rounded-2xl shrink-0 ${style.iconBg} border border-white/10 shadow-sm`}>
            <CategoryIcon className="w-5 h-5" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${style.badge}`}>
                {notification.priority}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/60 text-slate-400 border border-slate-700/50 uppercase tracking-wider font-mono">
                {notification.category}
              </span>
              {!notification.is_read && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {notification.message}
            </p>
            <p className="text-[10px] text-slate-400 font-mono pt-1">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
          {!notification.is_read && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              title="Mark as Read"
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(notification.id)}
              title="Delete Notification"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
