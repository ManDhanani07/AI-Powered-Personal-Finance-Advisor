import React, { memo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCompactFinancial, formatDate } from '../../utils/formatters.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const dataPoint = payload[0]?.payload;
  const isProj = dataPoint?.isProjection;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-3.5 text-xs space-y-1.5 min-w-[180px]">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <p className="font-bold text-white">{formatDate(label, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isProj ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-slate-800 text-slate-400'}`}>
          {isProj ? 'Predicted' : 'Historical'}
        </span>
      </div>

      {payload.map((p) => {
        if (!p.value && p.value !== 0) return null;
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="capitalize">{p.name}:</span>
            </span>
            <span className="font-bold text-white font-outfit">
              {formatCompactFinancial(p.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ForecastChart = memo(({ expenseForecast = [], incomeForecast = [], selectedMetric = 'ALL', loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse p-6 rounded-3xl border border-border-subtle bg-bg-surface space-y-4">
        <div className="h-5 bg-slate-800 rounded w-1/4" />
        <div className="h-72 bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  // Merge expense and income points by ds
  const mergedMap = new Map();

  expenseForecast.forEach((p) => {
    const dsKey = String(p.ds);
    mergedMap.set(dsKey, {
      ds: p.ds,
      expenseHistorical: p.is_projection ? null : Number(p.yhat),
      expenseProjected: p.is_projection ? Number(p.yhat) : null,
      expenseLower: Number(p.yhat_lower),
      expenseUpper: Number(p.yhat_upper),
      isProjection: p.is_projection,
    });
  });

  incomeForecast.forEach((p) => {
    const dsKey = String(p.ds);
    const existing = mergedMap.get(dsKey) || { ds: p.ds, isProjection: p.is_projection };
    mergedMap.set(dsKey, {
      ...existing,
      incomeHistorical: p.is_projection ? null : Number(p.yhat),
      incomeProjected: p.is_projection ? Number(p.yhat) : null,
    });
  });

  const chartData = Array.from(mergedMap.values()).sort((a, b) => new Date(a.ds) - new Date(b.ds));

  // Downsample data if > 100 points for smooth rendering
  const step = Math.max(1, Math.floor(chartData.length / 90));
  const sampledData = chartData.filter((_, i) => i % step === 0);

  // Find transition index between historical and projection
  const firstProjIndex = sampledData.findIndex((d) => d.isProjection);
  const splitDate = firstProjIndex >= 0 ? sampledData[firstProjIndex]?.ds : null;

  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
            Meta Prophet Forecast Canvas
          </h3>
          <p className="text-xs text-slate-400">
            Historical transaction baselines vs Meta Prophet future projections
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" /> Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-400" /> Expense
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 border-dashed border-t" /> Projection
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={sampledData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
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

          {splitDate && (
            <ReferenceLine
              x={splitDate}
              stroke="#6366F1"
              strokeDasharray="4 4"
              label={{
                value: 'Today / Projection Start',
                fill: '#818CF8',
                fontSize: 10,
                position: 'top',
              }}
            />
          )}

          {/* Historical Lines */}
          <Line
            type="monotone"
            dataKey="incomeHistorical"
            name="Historical Income"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expenseHistorical"
            name="Historical Expense"
            stroke="#F43F5E"
            strokeWidth={2.5}
            dot={false}
          />

          {/* Projection Lines & Glow Areas */}
          <Area
            type="monotone"
            dataKey="incomeProjected"
            name="Projected Income"
            stroke="#34D399"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            fill="url(#incomeGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="expenseProjected"
            name="Projected Expense"
            stroke="#FB7185"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            fill="url(#expenseGrad)"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

ForecastChart.displayName = 'ForecastChart';
export default ForecastChart;
