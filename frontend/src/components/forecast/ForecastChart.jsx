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
    <div className="rounded-2xl border border-zinc-800 bg-[#09090B] shadow-2xl p-3.5 text-xs space-y-1.5 min-w-[200px] backdrop-blur-xl">
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
        <p className="font-bold text-white font-outfit">{formatDate(label, { month: 'long', year: 'numeric' })}</p>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isProj ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-slate-400'}`}>
          {isProj ? 'Predicted Month' : 'Historical Month'}
        </span>
      </div>

      {payload.map((p) => {
        if (p.value === null || p.value === undefined) return null;
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
      <div className="animate-pulse p-6 rounded-3xl border border-zinc-800 bg-[#09090B] space-y-4">
        <div className="h-5 bg-zinc-800 rounded w-1/4" />
        <div className="h-72 bg-zinc-800/60 rounded-2xl" />
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

  // Find transition index between historical and projection
  const firstProjIndex = chartData.findIndex((d) => d.isProjection);
  const splitDate = firstProjIndex >= 0 ? chartData[firstProjIndex]?.ds : null;

  // Bridge boundary gap seamlessly between solid historical and dashed projection lines
  if (firstProjIndex > 0) {
    const lastHist = chartData[firstProjIndex - 1];
    lastHist.expenseProjected = lastHist.expenseHistorical;
    lastHist.incomeProjected = lastHist.incomeHistorical;
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white font-outfit">
            Meta Prophet Forecast Canvas
          </h3>
          <p className="text-xs text-slate-400 font-normal">
            Monthly transaction baselines vs Meta Prophet future projections (1 Jan – 1 Dec)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" /> Monthly Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-400" /> Monthly Expense
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 border-dashed border-t" /> Projection Horizon
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 25, right: 15, left: -10, bottom: 0 }}>
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

          {splitDate && (
            <ReferenceLine
              x={splitDate}
              stroke="#818CF8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Projection Start',
                fill: '#818CF8',
                fontSize: 10,
                fontWeight: 700,
                position: 'insideTopLeft',
                dy: -18,
              }}
            />
          )}

          {/* Historical Expense Line */}
          {(selectedMetric === 'ALL' || selectedMetric === 'EXPENSE') && (
            <Line
              type="monotone"
              dataKey="expenseHistorical"
              name="Historical Expense"
              stroke="#F43F5E"
              strokeWidth={3}
              dot={{ fill: '#F43F5E', r: 4 }}
              connectNulls
            />
          )}

          {/* Projected Expense Line */}
          {(selectedMetric === 'ALL' || selectedMetric === 'EXPENSE') && (
            <Line
              type="monotone"
              dataKey="expenseProjected"
              name="Projected Expense"
              stroke="#F43F5E"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#F43F5E', r: 4 }}
              connectNulls
            />
          )}

          {/* Historical Income Line */}
          {(selectedMetric === 'ALL' || selectedMetric === 'INCOME') && (
            <Line
              type="monotone"
              dataKey="incomeHistorical"
              name="Historical Income"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              connectNulls
            />
          )}

          {/* Projected Income Line */}
          {(selectedMetric === 'ALL' || selectedMetric === 'INCOME') && (
            <Line
              type="monotone"
              dataKey="incomeProjected"
              name="Projected Income"
              stroke="#10B981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#10B981', r: 4 }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

ForecastChart.displayName = 'ForecastChart';
export default ForecastChart;
