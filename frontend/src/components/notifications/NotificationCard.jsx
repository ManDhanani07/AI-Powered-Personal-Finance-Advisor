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

const PRIORITY_THEMES = {
  CRITICAL: {
    borderLeft: 'border-l-rose-500',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: AlertTriangle,
  },
  HIGH: {
    borderLeft: 'border-l-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: AlertCircle,
  },
  MEDIUM: {
    borderLeft: 'border-l-indigo-500',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: Info,
  },
  LOW: {
    borderLeft: 'border-l-zinc-700',
    iconBg: 'bg-zinc-800 text-slate-400 border-zinc-700',
    badge: 'bg-zinc-800 text-slate-400 border-zinc-700',
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

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Just now';

  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  if (!notification) return null;

  const priorityKey = (notification.priority || 'LOW').toUpperCase();
  const theme = PRIORITY_THEMES[priorityKey] || PRIORITY_THEMES.LOW;
  const CategoryIcon = CATEGORY_ICONS[notification.category?.toUpperCase()] || theme.icon;

  const isUnread = !notification.is_read;

  return (
    <div
      className={`p-4 rounded-xl border-y border-r border-zinc-800/80 border-l-4 ${theme.borderLeft} bg-[#09090B] transition-all duration-200 hover:bg-zinc-900/60 relative group ${
        isUnread ? 'bg-zinc-900/40' : 'opacity-80'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Icon & Message Body */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${theme.iconBg} border flex items-center justify-center`}>
            <CategoryIcon className="w-4 h-4" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {notification.title}
              </h4>

              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" title="Unread" />
              )}

              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${theme.badge}`}>
                {notification.priority}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 text-slate-400 border border-zinc-800 uppercase">
                {notification.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {notification.message}
            </p>

            <p className="text-[11px] text-slate-500 font-mono pt-0.5">
              {formatTimeAgo(notification.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons (Mark Read & Delete) */}
        <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {isUnread && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              title="Mark as Read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(notification.id)}
              title="Delete Notification"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
