import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { History, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-2xl border border-border-strong bg-dark-900 shadow-2xl p-3 text-xs space-y-1">
      <p className="font-bold text-white">{label}</p>
      <p className="text-primary-400 font-extrabold text-sm">
        Score: {val.toFixed(1)} / 100
      </p>
    </div>
  );
};

export const HealthHistory = ({ history = [] }) => {
  const chartData = [...history]
    .reverse()
    .map((item) => ({
      date: formatDate(item.calculated_at, { month: 'short', day: 'numeric' }),
      Score: Number(item.health_score),
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">
              Score History Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Track historical financial health score changes over time
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          Live Timeline
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-xs text-slate-400">
          No history recorded yet. Recalculate score to generate history points.
        </div>
      ) : (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(37, 99, 235, 0.3)' }} />
              <Line
                type="monotone"
                dataKey="Score"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ fill: '#14B8A6', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, strokeWidth: 3, stroke: '#2563EB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default HealthHistory;
