import React, { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactFinancial, formatCurrency } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const incomeVal = payload.find((p) => p.dataKey === 'Income')?.value || 0;
  const expenseVal = payload.find((p) => p.dataKey === 'Expense')?.value || 0;
  const netMargin = incomeVal - expenseVal;

  return (
    <div className="rounded-2xl bg-[#09090B]/95 border border-zinc-800 shadow-2xl p-3.5 text-xs space-y-2 min-w-[190px] backdrop-blur-md font-sans">
      <p className="font-bold text-white font-outfit border-b border-zinc-800/80 pb-1.5">{label}</p>
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
      <div className="border-t border-zinc-800/80 pt-1.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-400 font-outfit">Net Margin:</span>
        <span className={`font-bold font-mono text-xs ${netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {netMargin >= 0 ? '+' : ''}{formatCurrency(netMargin)}
        </span>
      </div>
    </div>
  );
};

const SkeletonChart = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-5 bg-zinc-800 rounded w-1/3" />
    <div className="h-60 bg-zinc-800/60 rounded-2xl" />
  </div>
);

export const IncomeExpenseChart = memo(({ charts, loading, onSeeded }) => {
  if (loading) return <SkeletonChart />;

  const rawData = charts?.income_expense_monthly || [];
  const monthMap = {
    jan: '1 Jan',
    feb: '1 Feb',
    mar: '1 Mar',
    apr: '1 Apr',
    may: '1 May',
    jun: '1 Jun',
    jul: '1 Jul',
    aug: '1 Aug',
    sep: '1 Sep',
    oct: '1 Oct',
    nov: '1 Nov',
    dec: '1 Dec',
  };

  const data = rawData.map((d) => {
    const rawMonth = d.month || '';
    const prefix = rawMonth.trim().slice(0, 3).toLowerCase();
    const displayLabel = monthMap[prefix] || rawMonth;

    return {
      month: displayLabel,
      fullMonth: rawMonth,
      Income: Number(d.income ?? 0),
      Expense: Number(d.expense ?? 0),
    };
  });

  const hasData = data.some((d) => d.Income > 0 || d.Expense > 0);

  return (
    <div className="space-y-4 font-sans">
      <div>
        <h3 className="text-base font-bold text-white font-outfit">
          Income vs Expense
        </h3>
        <p className="text-xs text-slate-400">12-month comparative cash flow breakdown</p>
      </div>
      {!hasData ? (
        <EmptyLedgerCallout title="Income vs Expense Graph Empty" onSeeded={onSeeded} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              angle={-25}
              textAnchor="end"
              height={45}
              padding={{ left: 12, right: 12 }}
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
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend
              align="right"
              verticalAlign="top"
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs font-bold text-slate-300 capitalize">{value === 'Expense' ? 'Expenses' : value}</span>
              )}
            />

            {/* Income Pure Vivid Green Line with Circular Point Markers */}
            <Line
              type="linear"
              dataKey="Income"
              name="Income"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4.5, fill: '#10B981', stroke: '#10B981', strokeWidth: 0 }}
              activeDot={{ r: 6.5, fill: '#10B981', stroke: '#064e3b', strokeWidth: 2 }}
              animationDuration={1200}
            />

            {/* Expenses Pure Vivid Red Line with Point Markers */}
            <Line
              type="linear"
              dataKey="Expense"
              name="Expenses"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ r: 4.5, fill: '#EF4444', stroke: '#EF4444', strokeWidth: 0 }}
              activeDot={{ r: 6.5, fill: '#EF4444', stroke: '#7f1d1d', strokeWidth: 2 }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

IncomeExpenseChart.displayName = 'IncomeExpenseChart';
export default IncomeExpenseChart;
