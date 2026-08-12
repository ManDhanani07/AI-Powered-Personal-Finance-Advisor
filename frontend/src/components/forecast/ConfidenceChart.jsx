import React, { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactFinancial, formatDate } from '../../utils/formatters.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#09090B] shadow-2xl p-3 text-xs space-y-1 backdrop-blur-xl">
      <p className="font-bold text-white mb-1 font-outfit">
        {formatDate(label, { month: 'long', year: 'numeric' })}
      </p>
      <div className="flex items-center justify-between gap-3 text-emerald-400">
        <span>Expected Balance:</span>
        <span className="font-bold font-outfit">{formatCompactFinancial(d?.yhat)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-400 text-[11px]">
        <span>95% Confidence Band:</span>
        <span className="font-medium font-mono">{formatCompactFinancial(d?.yhat_lower)} – {formatCompactFinancial(d?.yhat_upper)}</span>
      </div>
    </div>
  );
};

export const ConfidenceChart = memo(({ balanceForecast = [], loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse p-6 rounded-3xl border border-zinc-800 bg-[#09090B] space-y-4">
        <div className="h-5 bg-zinc-800 rounded w-1/4" />
        <div className="h-64 bg-zinc-800/60 rounded-2xl" />
      </div>
    );
  }

  const data = balanceForecast.map((p) => ({
    ds: p.ds,
    yhat: Number(p.yhat),
    yhat_lower: Number(p.yhat_lower),
    yhat_upper: Number(p.yhat_upper),
    band: [Number(p.yhat_lower), Number(p.yhat_upper)],
  }));

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-outfit">
            Account Balance 95% Confidence Interval
          </h3>
          <p className="text-xs text-slate-400 font-normal">
            Upper and lower monthly variance boundaries calculated via Meta Prophet sampling (1 Jan – 1 Dec)
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 font-mono">
          95% Confidence Horizon
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />

          <XAxis
            dataKey="ds"
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => formatDate(val, { day: 'numeric', month: 'short' })}
          />

          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompactFinancial(v)}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          {/* 95% Confidence Range Area */}
          <Area
            type="monotone"
            dataKey="band"
            name="95% Confidence Range"
            stroke="#818CF8"
            strokeWidth={1}
            fill="url(#confidenceBand)"
          />

          {/* Expected Mean Prediction Line */}
          <Area
            type="monotone"
            dataKey="yhat"
            name="Expected Balance"
            stroke="#6366F1"
            strokeWidth={3}
            fill="none"
            dot={{ fill: '#00F2FE', r: 4, strokeWidth: 2, stroke: '#09090B' }}
            activeDot={{ r: 7, strokeWidth: 3, stroke: '#6366F1', fill: '#00F2FE' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

ConfidenceChart.displayName = 'ConfidenceChart';
export default ConfidenceChart;
