import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Activity } from 'lucide-react';
import ScoreGauge from './ScoreGauge.jsx';
import { formatDate } from '../../utils/formatters.js';

export const HealthScoreCard = ({ score = 0, calculatedAt, refreshing, onRefresh }) => {
  const formattedDate = calculatedAt
    ? formatDate(calculatedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  const getScoreTheme = (val) => {
    if (val >= 85) return { text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Prime Standing' };
    if (val >= 70) return { text: 'text-sky-400', badge: 'bg-sky-500/10 border-sky-500/30 text-sky-400', label: 'Healthy Standing' };
    if (val >= 50) return { text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'Fair Standing' };
    return { text: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400', label: 'Needs Attention' };
  };

  const theme = getScoreTheme(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center p-4 relative"
    >
      {/* Top Header Pill & Refresh */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-extrabold uppercase tracking-wider font-outfit">
          <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          <span>Health Gauge</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          title="Recalculate Score"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Radial Score Arc */}
      <div className="my-1">
        <ScoreGauge score={score} />
      </div>

      {/* Status Pill & Timestamp */}
      <div className="space-y-1">
        <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${theme.badge}`}>
          {theme.label}
        </span>
        <p className="text-[11px] text-slate-500 font-medium">
          Calculated: <span className="text-slate-300 font-semibold">{formattedDate}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default HealthScoreCard;
