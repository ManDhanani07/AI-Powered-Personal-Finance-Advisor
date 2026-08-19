import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { LineChart as ChartIcon, Sparkles } from 'lucide-react';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const CustomForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  const isForecast = point?.isForecast;
  const actualVal = point?.actual;
  const forecastVal = point?.forecast;
  const p10Val = point?.p10;
  const p90Val = point?.p90;

  return (
    <div className="rounded-2xl border border-zinc-700/80 bg-[#09090B]/95 p-4 shadow-2xl backdrop-blur-xl space-y-2 min-w-[200px]">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="text-xs font-black text-white font-outfit">
          {point?.period || label}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-outfit border ${
            isForecast
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {isForecast ? 'AI Forecast' : 'Actual Spend'}
        </span>
      </div>

      <div className="space-y-1 text-xs">
        {actualVal !== null && actualVal !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Actual Outflow:</span>
            <span className="font-bold font-mono text-emerald-400">
              {formatCurrency(actualVal)}
            </span>
          </div>
        )}

        {forecastVal !== null && forecastVal !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Predicted Outflow:</span>
            <span className="font-black font-mono text-cyan-300">
              {formatCurrency(forecastVal)}
            </span>
          </div>
        )}

        {p10Val && p90Val && (
          <div className="pt-1.5 border-t border-zinc-800 text-[11px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Frugal Floor (P10):</span>
              <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(p10Val)}</span>
            </div>
            <div className="flex justify-between">
              <span>Peak Cap (P90):</span>
              <span className="font-mono text-purple-400 font-semibold">{formatCurrency(p90Val)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const UnifiedExpenseForecastChart = ({ historicalTrend, multiHorizonForecast, forecast }) => {
  const chartData = useMemo(() => {
    if (multiHorizonForecast && multiHorizonForecast.length > 0) {
      // Find the transition point between actual and forecast
      const histPoints = multiHorizonForecast.filter((p) => !p.is_forecast);
      const forePoints = multiHorizonForecast.filter((p) => p.is_forecast);
      const lastHist = histPoints[histPoints.length - 1];

      const combined = [];

      histPoints.forEach((p, idx) => {
        const isLastHist = idx === histPoints.length - 1;
        combined.push({
          name: p.month_name,
          period: p.period,
          actual: p.amount,
          // Bridge point connects actual to forecast line
          forecast: isLastHist ? p.amount : null,
          p10: null,
          p90: null,
          isForecast: false,
        });
      });

      forePoints.forEach((p) => {
        combined.push({
          name: p.month_name,
          period: p.period,
          actual: null,
          forecast: p.amount,
          p10: p.p10,
          p90: p.p90,
          isForecast: true,
        });
      });

      return combined;
    }

    // Fallback using historicalTrend
    if (historicalTrend && historicalTrend.length > 0) {
      return historicalTrend.map((h) => ({
        name: h.month_name?.split(' ')[0] || h.year_month,
        period: h.month_name,
        actual: !h.is_projected ? h.expense : null,
        forecast: h.is_projected ? h.expense : null,
        p10: h.is_projected ? h.expense * 0.85 : null,
        p90: h.is_projected ? h.expense * 1.15 : null,
        isForecast: h.is_projected,
      }));
    }

    return [];
  }, [multiHorizonForecast, historicalTrend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-6 shadow-glass"
    >
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wide">
              Expense Forecast
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Seamless trajectory from historical actuals to ML multi-horizon projection
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 self-start sm:self-auto text-xs font-bold font-outfit">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span className="text-slate-300">Actual</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-300 border-dashed" />
            <span className="text-cyan-300">Forecast</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-2 rounded bg-cyan-500/20 border border-cyan-500/40" />
            <span className="text-slate-400 text-[11px]">P10–P90 Range</span>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272A"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#71717A"
              tick={{ fill: '#A1A1AA', fontSize: 12, fontWeight: 700 }}
              axisLine={{ stroke: '#3F3F46' }}
              tickLine={false}
            />

            <YAxis
              stroke="#71717A"
              tick={{ fill: '#A1A1AA', fontSize: 11, fontWeight: 600 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomForecastTooltip />} />

            {/* Shaded Historical Area */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#actualGradient)"
            />

            {/* Shaded Forecast Area */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="none"
              fill="url(#forecastGradient)"
            />

            {/* Solid Line: Actual History */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#09090B' }}
              activeDot={{ r: 6, fill: '#34D399', stroke: '#09090B' }}
              connectNulls={false}
            />

            {/* Dashed Line: Forecast Trajectory */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#06B6D4"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#06B6D4', r: 4, strokeWidth: 2, stroke: '#09090B' }}
              activeDot={{ r: 6, fill: '#22D3EE', stroke: '#09090B' }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Axis Phase Demarcation Labels */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs font-black uppercase text-slate-500 font-outfit">
        <span>◀ Historical Data</span>
        <span className="text-cyan-400">Multi-Horizon Forecast ▶</span>
      </div>
    </motion.div>
  );
};

export default UnifiedExpenseForecastChart;
