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
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { Layers, BarChart2, PieChart } from 'lucide-react';

const PARAMETER_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#0EA5E9', // Sky
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#14B8A6', // Teal
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl p-3 text-xs space-y-1">
      <p className="font-bold text-white mb-1 font-outfit">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3 font-mono">
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="font-extrabold text-indigo-400">{p.value} pts</span>
        </div>
      ))}
    </div>
  );
};

export const HealthBreakdown = ({ parameters = [] }) => {
  const [viewType, setViewType] = useState('radar'); // 'radar' | 'bar'

  const chartData = parameters.map((p, i) => ({
    parameter: p.name,
    Earned: p.score,
    Max: p.max_score,
    color: PARAMETER_COLORS[i % PARAMETER_COLORS.length],
  }));

  const totalEarned = parameters.reduce((acc, p) => acc + (p.score || 0), 0);

  if (parameters.length === 0 || totalEarned === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2.5 border-b border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">
              Parameter Capacity Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Visual evaluation of weighted parameter scores vs max capacity
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
          <PieChart className="w-8 h-8 text-slate-600" />
          <p className="text-xs font-bold text-slate-300">No Ledger History Logged</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Log transactions to calculate parameter capacity breakdown.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">
              Parameter Capacity Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Visual evaluation of 7 weighted parameters vs maximum capacity
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewType('radar')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              viewType === 'radar'
                ? 'bg-white text-slate-950 shadow-sm'
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
                ? 'bg-white text-slate-950 shadow-sm'
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
              <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
              <PolarAngleAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar name="Points Earned" dataKey="Earned" stroke="#6366F1" fill="#6366F1" fillOpacity={0.45} />
              <Radar name="Max Points" dataKey="Max" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          ) : (
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              <XAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="Earned" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey="Max" fill="#ffffff" opacity={0.08} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default HealthBreakdown;
