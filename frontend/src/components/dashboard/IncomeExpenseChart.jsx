import React, { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatCompactFinancial, formatCurrency } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border-strong bg-bg-surface/95 backdrop-blur-xl shadow-2xl p-3.5 text-xs space-y-2 min-w-[170px]">
      <p className="font-bold text-white font-outfit border-b border-border-subtle pb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-slate-300 font-medium capitalize">{p.name}:</span>
          </div>
          <span className="font-bold text-white font-mono">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const SkeletonChart = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-5 bg-slate-800 rounded w-1/3" />
    <div className="h-60 bg-slate-800/60 rounded-2xl" />
  </div>
);

export const IncomeExpenseChart = memo(({ charts, loading, onSeeded }) => {
  if (loading) return <SkeletonChart />;

  const rawData = charts?.income_expense_monthly || [];
  const data = rawData.map((d) => {
    // Parse month string (e.g. "Sep 2025") into short "Sep 25" to prevent X-axis collision
    const rawMonth = d.month || '';
    const parts = rawMonth.split(' ');
    const shortLabel = parts.length === 2 ? `${parts[0]} '${parts[1].slice(2)}` : rawMonth;

    return {
      month: shortLabel,
      fullMonth: rawMonth,
      Income: Number(d.income ?? 0),
      Expense: Number(d.expense ?? 0),
    };
  });

  const hasData = data.some((d) => d.Income > 0 || d.Expense > 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
          <span>Income vs Expense</span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
            3D Pro
          </span>
        </h3>
        <p className="text-xs text-slate-400">12-month comparative cash flow breakdown</p>
      </div>
      {!hasData ? (
        <EmptyLedgerCallout title="Income vs Expense Graph Empty" onSeeded={onSeeded} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={6} barCategoryGap="25%" margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
            <defs>
              {/* 3D Glass Gradients */}
              <linearGradient id="income3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity={1} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="expense3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                <stop offset="100%" stopColor="#E11D48" stopOpacity={0.8} />
              </linearGradient>

              {/* 3D Drop Shadow */}
              <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              angle={-25}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCompactFinancial(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 8 }} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs font-bold text-slate-300 capitalize">{value}</span>
              )}
            />
            <Bar
              dataKey="Income"
              fill="url(#income3D)"
              radius={[6, 6, 0, 0]}
              filter="url(#barShadow)"
              animationDuration={1200}
            />
            <Bar
              dataKey="Expense"
              fill="url(#expense3D)"
              radius={[6, 6, 0, 0]}
              filter="url(#barShadow)"
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

IncomeExpenseChart.displayName = 'IncomeExpenseChart';
export default IncomeExpenseChart;
