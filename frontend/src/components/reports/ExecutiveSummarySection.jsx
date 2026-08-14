import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
  const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
  const net = income - expense;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-3.5 shadow-2xl space-y-2 min-w-[190px] font-sans">
      <p className="font-extrabold text-white font-outfit border-b border-zinc-800/80 pb-1.5 text-xs">
        {label} 2026
      </p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span className="text-slate-400 font-medium">Income:</span>
          </div>
          <span className="font-bold text-white font-mono">{formatCurrency(income)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm" />
            <span className="text-slate-400 font-medium">Expenses:</span>
          </div>
          <span className="font-bold text-white font-mono">{formatCurrency(expense)}</span>
        </div>

        <div className="border-t border-zinc-800/80 pt-1.5 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-slate-400">Net Surplus:</span>
          <span className={`font-black font-mono text-xs ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ExecutiveSummarySection = ({ summaryData, monthlyReport, comparison }) => {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'

  if (!summaryData || !summaryData.kpis) {
    return <EmptyState title="No Financial Data Available" message="No financial records found for the selected period filter." />;
  }

  const kpis = summaryData.kpis || {};
  const totalInc = Number(kpis.total_income || 0);
  const totalExp = Number(kpis.total_expenses || 0);
  const netSavings = Number(kpis.net_savings || 0);
  const savingsRate = Number(kpis.savings_rate || 0);
  const highestCat = kpis.highest_expense_category || 'General';

  // Build a smart, non-redundant executive takeaway
  let strategicTakeaway = '';
  if (summaryData.executive_insight && !summaryData.executive_insight.includes('total ₹') && !summaryData.executive_insight.includes('total $')) {
    strategicTakeaway = summaryData.executive_insight;
  } else if (totalInc > 0 && totalExp > 0) {
    const surplusPct = ((netSavings / totalInc) * 100).toFixed(1);
    strategicTakeaway = `Operating at a ${surplusPct}% capital retention rate across this period, with ${highestCat} representing your largest spending allocation.`;
  } else {
    strategicTakeaway = `All cash flow parameters and financial ledger entries are active and synchronized with live PostgreSQL transactions.`;
  }

  const renderComparisonBadge = (compKey, isInverse = false) => {
    if (!comparison || !comparison[compKey]) return null;
    const { pct_change } = comparison[compKey];
    if (pct_change === 0 || pct_change === undefined) return null;

    const isPositive = pct_change > 0;
    const isGood = isInverse ? !isPositive : isPositive;
    const badgeColor = isGood
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${badgeColor}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(pct_change)}%
      </span>
    );
  };

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalInc),
      subText: `From ${kpis.transaction_count || 0} transactions`,
      icon: TrendingUp,
      compKey: 'total_income',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      bg: 'bg-gradient-to-b from-emerald-500/[0.12] to-zinc-950/80',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20',
      accent: 'text-emerald-400',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExp),
      subText: `Top category: ${highestCat}`,
      icon: TrendingDown,
      compKey: 'total_expenses',
      isInverse: true,
      border: 'border-rose-500/30 hover:border-rose-500/60',
      bg: 'bg-gradient-to-b from-rose-500/[0.12] to-zinc-950/80',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20',
      accent: 'text-rose-400',
    },
    {
      title: 'Net Savings',
      value: formatCurrency(netSavings),
      subText: `Net cash surplus`,
      icon: PiggyBank,
      compKey: 'net_savings',
      border: 'border-indigo-500/30 hover:border-indigo-500/60',
      bg: 'bg-gradient-to-b from-indigo-500/[0.12] to-zinc-950/80',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20',
      accent: 'text-indigo-400',
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      subText: `Surplus ratio`,
      icon: Percent,
      compKey: 'savings_rate',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      bg: 'bg-gradient-to-b from-amber-500/[0.12] to-zinc-950/80',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20',
      accent: 'text-amber-400',
    },
    {
      title: 'Health Score',
      value: `${kpis.health_score || 75.0}/100`,
      subText: `Grade: ${kpis.health_grade || 'B'}`,
      icon: Target,
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      bg: 'bg-gradient-to-b from-cyan-500/[0.12] to-zinc-950/80',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600 shadow-cyan-500/20',
      accent: 'text-cyan-400',
    },
  ];

  // Month map
  const MONTHS_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let rawMonthly = monthlyReport?.monthly_breakdown || [];
  
  // Format chart items
  let chartData = [];
  if (Array.isArray(rawMonthly) && rawMonthly.length > 0) {
    chartData = rawMonthly.map((m) => ({
      month: m.month || '',
      income: Number(m.income || 0),
      expense: Number(m.expense || 0),
      net: Number(m.income || 0) - Number(m.expense || 0),
    }));
  } else {
    chartData = MONTHS_ORDER.map((mName, idx) => ({
      month: mName,
      income: idx === 7 ? totalInc : 0,
      expense: idx === 7 ? totalExp : 0,
      net: idx === 7 ? netSavings : 0,
    }));
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Strategic Executive Intelligence Banner (Non-Redundant) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/[0.10] via-purple-500/[0.06] to-cyan-500/[0.08] border border-indigo-500/30 backdrop-blur-xl flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300 font-outfit">
              Executive Strategic Brief
            </p>
            <p className="text-xs font-semibold text-slate-200 leading-relaxed font-sans mt-0.5">
              {strategicTakeaway}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold font-outfit">
            {savingsRate >= 20 ? 'Optimal Surplus' : 'Moderate Flow'}
          </span>
        </div>
      </div>

      {/* 2. 5 Multi-Colored Core KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${card.border} ${card.bg} backdrop-blur-md shadow-xl relative overflow-hidden transition-all duration-200 hover:-translate-y-1 group flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-outfit">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-xl ${card.iconBg} text-white flex items-center justify-center shadow-md shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-1 space-y-0.5">
                <h3 className="text-lg sm:text-xl font-black text-white font-outfit tracking-tight">
                  {card.value}
                </h3>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] text-slate-400 font-mono truncate">{card.subText}</p>
                  {card.compKey && renderComparisonBadge(card.compKey, card.isInverse)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Income vs Expenses Trajectory Chart */}
      <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-2xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Income vs Expenses Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              12-month timeline comparative cash flow and monthly surplus volume
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 font-outfit ${
                chartType === 'bar'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-slate-400 hover:text-white'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar View</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 font-outfit ${
                chartType === 'area'
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                  : 'bg-zinc-900 border-zinc-800 text-slate-400 hover:text-white'
              }`}
              title="Area Flow View"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Area Flow</span>
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 10 }}>
                <defs>
                  <linearGradient id="incBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="expBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#BE123C" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCompactFinancial(v)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                  formatter={(v) => <span className="text-xs font-bold text-slate-300">{v}</span>}
                />
                <Bar dataKey="income" name="Income" fill="url(#incBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="expense" name="Expenses" fill="url(#expBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 10 }}>
                <defs>
                  <linearGradient id="incAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCompactFinancial(v)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                  formatter={(v) => <span className="text-xs font-bold text-slate-300">{v}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#incAreaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expenses"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fill="url(#expAreaGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
