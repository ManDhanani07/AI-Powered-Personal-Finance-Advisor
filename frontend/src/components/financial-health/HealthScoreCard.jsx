import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Activity } from 'lucide-react';
import ScoreGauge from './ScoreGauge.jsx';
import { formatDate } from '../../utils/formatters.js';

export const HealthScoreCard = ({ score = 0, calculatedAt, refreshing, onRefresh }) => {
  const formattedDate = calculatedAt
    ? formatDate(calculatedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Top Header Pill */}
      <div className="flex items-center justify-between w-full mb-4 z-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#121216] text-indigo-400 text-xs font-extrabold uppercase tracking-widest font-outfit">
          <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          <span>Financial Health Index</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl bg-[#121216] text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Recalculate Score"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Radial Score Gauge */}
      <div className="my-2 z-10">
        <ScoreGauge score={score} />
      </div>

      {/* Bottom Footer Meta */}
      <p className="text-xs text-slate-400 mt-2 font-medium z-10">
        Last calculated from database: <span className="text-slate-200 font-semibold">{formattedDate}</span>
      </p>
    </motion.div>
  );
};

export default HealthScoreCard;
