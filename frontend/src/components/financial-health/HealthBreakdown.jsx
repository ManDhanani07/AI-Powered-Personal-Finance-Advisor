import React, { useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { Layers, BarChart2, PieChart } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border-strong bg-dark-900 shadow-2xl p-3 text-xs space-y-1">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="font-extrabold font-mono text-primary-400">{p.value} pts</span>
        </div>
      ))}
    </div>
  );
};

export const HealthBreakdown = ({ parameters = [] }) => {
  const [viewType, setViewType] = useState('radar'); // 'radar' | 'bar'

  const chartData = parameters.map((p) => ({
    parameter: p.name,
    Earned: p.score,
    Max: p.max_score,
  }));

  const totalEarned = parameters.reduce((acc, p) => acc + (p.score || 0), 0);

  if (parameters.length === 0 || totalEarned === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4"
      >
        <div className="flex items-center space-x-2.5 border-b border-border-subtle pb-4">
          <div className="p-2.5 rounded-2xl bg-accent-500/10 text-accent-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">
              Parameter Score Capacity Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Visual evaluation of 7 weighted parameters vs maximum capacity
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
          <PieChart className="w-8 h-8 text-slate-500" />
          <p className="text-xs font-bold text-slate-300">No Ledger History Logged</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Log your income and expense transactions to calculate parameter capacity distribution.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-accent-500/10 text-accent-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">
              Parameter Score Capacity Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Visual evaluation of 7 weighted parameters vs maximum capacity
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle">
          <button
            onClick={() => setViewType('radar')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              viewType === 'radar'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Radar</span>
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              viewType === 'bar'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
              <PolarAngleAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar name="Points Earned" dataKey="Earned" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
              <Radar name="Max Points" dataKey="Max" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.15} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          ) : (
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
              <XAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Earned" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Max" fill="#14B8A6" opacity={0.3} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default HealthBreakdown;
