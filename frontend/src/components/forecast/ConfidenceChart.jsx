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
    <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-3 text-xs space-y-1">
      <p className="font-bold text-white mb-1">
        {formatDate(label, { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
      <div className="flex items-center justify-between gap-3 text-emerald-400">
        <span>Expected Balance:</span>
        <span className="font-bold font-outfit">{formatCompactFinancial(d?.yhat)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-400 text-[11px]">
        <span>95% Confidence Band:</span>
        <span className="font-medium">{formatCompactFinancial(d?.yhat_lower)} – {formatCompactFinancial(d?.yhat_upper)}</span>
      </div>
    </div>
  );
};

export const ConfidenceChart = memo(({ balanceForecast = [], loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse p-6 rounded-3xl border border-border-subtle bg-bg-surface space-y-4">
        <div className="h-5 bg-slate-800 rounded w-1/4" />
        <div className="h-64 bg-slate-800/60 rounded-2xl" />
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

  // Downsample data if large
  const step = Math.max(1, Math.floor(data.length / 90));
  const sampledData = data.filter((_, i) => i % step === 0);

  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
            Account Balance 95% Confidence Interval
          </h3>
          <p className="text-xs text-slate-400">
            Upper and lower variance boundaries calculated via Meta Prophet sampling
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
          95% Confidence Horizon
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={sampledData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />

          <XAxis
            dataKey="ds"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => formatDate(val, { month: 'short', day: 'numeric' })}
          />

          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompactFinancial(v)}
          />

          <Tooltip content={<CustomTooltip />} />

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
            strokeWidth={2.5}
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

ConfidenceChart.displayName = 'ConfidenceChart';
export default ConfidenceChart;
