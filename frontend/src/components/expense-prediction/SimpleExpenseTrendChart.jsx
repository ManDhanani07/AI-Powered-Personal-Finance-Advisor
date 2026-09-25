import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const SimpleExpenseTrendChart = ({ historicalTrend = [] }) => {
  if (!historicalTrend || historicalTrend.length === 0) {
    return null;
  }

  // Build the combined data series
  const { chartData, lastActual, forecastPoint, diffFromLast, diffPctFromLast } = useMemo(() => {
    const histPoints = historicalTrend.filter((p) => !p.is_projected);
    const forePoints = historicalTrend.filter((p) => p.is_projected);

    const combined = [];
    histPoints.forEach((p, idx) => {
      const isLastHist = idx === histPoints.length - 1;
      const rawName = p.month_name?.replace(' (Projected)', '').replace(' (Forecast)', '') || '';
      combined.push({
        name: rawName,
        actual: Number(p.expense || 0),
        forecast: isLastHist ? Number(p.expense || 0) : null,
        isProjected: false,
      });
    });

    forePoints.forEach((p) => {
      const rawName = p.month_name?.replace(' (Projected)', '').replace(' (Forecast)', '') || '';
      combined.push({
        name: rawName,
        actual: null,
        forecast: Number(p.expense || 0),
        isProjected: true,
      });
    });

    const lastAct = histPoints.length > 0 ? histPoints[histPoints.length - 1] : null;
    const fore = forePoints.length > 0 ? forePoints[0] : null;
    const diff = fore && lastAct ? Number(fore.expense) - Number(lastAct.expense) : 0;
    const diffPct =
      lastAct && Number(lastAct.expense) > 0
        ? ((diff / Number(lastAct.expense)) * 100).toFixed(1)
        : '0.0';

    return {
      chartData: combined,
      lastActual: lastAct,
      forecastPoint: fore,
      diffFromLast: diff,
      diffPctFromLast: diffPct,
    };
  }, [historicalTrend]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;

      const isForecast = Boolean(dataPoint.isProjected);
      const amount = isForecast ? dataPoint.forecast : dataPoint.actual;

      return (
        <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-md min-w-[190px]">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400 font-outfit font-medium">
            <span>{dataPoint.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isForecast
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isForecast ? 'AI Forecast' : 'Actual Spend'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-base font-black text-white font-mono">
              {formatCurrency(amount || 0)}
            </span>
          </div>

          {isForecast && lastActual && (
            <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80 text-[11px] font-outfit text-slate-400 flex items-center justify-between">
              <span>vs Last Month:</span>
              <span
                className={`font-mono font-bold ${
                  diffFromLast >= 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {diffFromLast >= 0 ? '+' : ''}
                {diffPctFromLast}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-glass backdrop-blur-xl space-y-4">
      {/* Header: Title, trajectory badge, and legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-outfit flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Monthly Spending Trend</span>
          </h2>
          <p className="text-xs text-slate-400 font-outfit mt-0.5">
            Historical monthly spending transitioning into next month's forecast
          </p>
        </div>

        {/* Badges and Legend */}
        <div className="flex items-center gap-4 text-xs font-outfit flex-wrap">
          {forecastPoint && lastActual && (
            <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-400">Projected Shift:</span>
              <span
                className={`font-bold ${
                  diffFromLast > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {diffFromLast > 0 ? '+' : ''}
                {diffPctFromLast}%
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400" />
              <span className="text-cyan-300">Prediction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas using ComposedChart */}
      <div className="h-64 sm:h-72 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="actualExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} opacity={0.5} />

            <XAxis
              dataKey="name"
              stroke="#71717A"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickFormatter={(val) => (chartData.length > 7 ? val.replace(/ 20(\d\d)/, " '$1") : val)}
              tick={{ fill: '#A1A1AA', fontSize: 10.5, fontFamily: 'Outfit, sans-serif' }}
              dy={6}
            />

            <YAxis
              stroke="#71717A"
              tickLine={false}
              axisLine={false}
              domain={[
                (dataMin) => Math.max(0, Math.floor((dataMin * 0.9) / 2000) * 2000),
                (dataMax) => Math.ceil((dataMax * 1.08) / 2000) * 2000,
              ]}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Shaded Historical Area */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#actualExpenseGrad)"
              connectNulls={false}
            />

            {/* Shaded Forecast Transition Area */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="none"
              fill="url(#forecastExpenseGrad)"
              connectNulls={true}
            />

            {/* Solid Line: Historical Spend */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#09090B' }}
              activeDot={{ r: 6, fill: '#34D399', stroke: '#09090B' }}
              connectNulls={false}
            />

            {/* Dashed Line: Forecast Trajectory */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#06B6D4"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ fill: '#06B6D4', r: 5, strokeWidth: 2, stroke: '#09090B' }}
              activeDot={{ r: 7, fill: '#22D3EE', stroke: '#09090B' }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimpleExpenseTrendChart;
