import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, PiggyBank, Percent, Target, Lightbulb } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const ExecutiveSummarySection = ({ summaryData, monthlyReport, comparison }) => {
  if (!summaryData || !summaryData.kpis) {
    return <EmptyState title="No Financial Data Available" message="No financial records found for the selected period filter." />;
  }

  const kpis = summaryData.kpis || {};
  const insightText = summaryData.executive_insight || '';

  const renderBadge = (compKey, isInverse = false) => {
    if (!comparison || !comparison[compKey]) return null;
    const { pct_change } = comparison[compKey];
    if (pct_change === 0) return null;

    const isPositive = pct_change > 0;
    const isGood = isInverse ? !isPositive : isPositive;
    const badgeColor = isGood ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    const arrow = isPositive ? '↑' : '↓';

    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeColor}`}>
        {arrow} {Math.abs(pct_change)}%
      </span>
    );
  };

  const cards = [
    {
      title: 'Total Income',
      value: formatINR(kpis.total_income),
      subText: `From ${kpis.transaction_count || 0} transactions`,
      icon: TrendingUp,
      compKey: 'total_income',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Total Expenses',
      value: formatINR(kpis.total_expenses),
      subText: `Top category: ${kpis.highest_expense_category || 'N/A'}`,
      icon: TrendingDown,
      compKey: 'total_expenses',
      isInverse: true,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    },
    {
      title: 'Net Savings',
      value: formatINR(kpis.net_savings),
      subText: `Net cash surplus`,
      icon: PiggyBank,
      compKey: 'net_savings',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Savings Rate',
      value: `${kpis.savings_rate}%`,
      subText: `Surplus ratio`,
      icon: Percent,
      compKey: 'savings_rate',
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400',
    },
    {
      title: 'Health Score',
      value: `${kpis.health_score || 75.0} / 100`,
      subText: `Grade: ${kpis.health_grade || 'B'}`,
      icon: Target,
      color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-400',
    },
  ];

  const chartData = monthlyReport?.monthly_breakdown || [
    { month: 'Jan', income: kpis.total_income || 0, expense: kpis.total_expenses || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Financial Insight Banner */}
      {insightText && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-primary-900/30 via-indigo-950/20 to-purple-900/30 border border-primary-500/30 backdrop-blur-xl flex items-start gap-3 shadow-lg">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-slate-200 leading-relaxed">
            {insightText}
          </p>
        </div>
      )}

      {/* 5 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-gradient-to-br border backdrop-blur-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className="p-2 rounded-2xl bg-bg-card/50 border border-white/10 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-1">
                <h3 className="text-xl font-black text-white tracking-tight">{card.value}</h3>
                {card.compKey && renderBadge(card.compKey, card.isInverse)}
              </div>

              <p className="text-[11px] text-slate-400 mt-1 font-mono">{card.subText}</p>
            </div>
          );
        })}
      </div>

      {/* Executive Income vs Expenses Chart */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <span>Income vs Expenses Trajectory</span>
          </h3>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val, name) => [formatINR(val), name === 'income' ? 'Income' : 'Expenses']}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
