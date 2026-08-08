import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  CreditCard,
  Store,
  Tag,
  Target,
  PieChart,
} from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const AnalyticsCards = ({ kpis, comparison }) => {
  if (!kpis) return null;

  const renderBadge = (compKey, isInverse = false) => {
    if (!comparison || !comparison[compKey]) return null;
    const { pct_change } = comparison[compKey];
    if (pct_change === 0) return null;

    const isPositive = pct_change > 0;
    // For expenses, positive change is usually bad (red) unless specified
    const isGood = isInverse ? !isPositive : isPositive;
    const badgeColor = isGood ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    const arrow = isPositive ? '↑' : '↓';

    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeColor}`}>
        {arrow} {Math.abs(pct_change)}% vs prev
      </span>
    );
  };

  const cards = [
    {
      title: 'Total Income',
      value: formatINR(kpis.total_income),
      subText: `${kpis.transaction_count || 0} Transactions`,
      icon: TrendingUp,
      compKey: 'total_income',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Total Expenses',
      value: formatINR(kpis.total_expenses),
      subText: `Top: ${kpis.highest_expense_category || 'N/A'}`,
      icon: TrendingDown,
      compKey: 'total_expenses',
      isInverse: true,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    },
    {
      title: 'Net Savings',
      value: formatINR(kpis.net_savings),
      subText: `Savings Rate: ${kpis.savings_rate}%`,
      icon: PiggyBank,
      compKey: 'net_savings',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Savings Rate',
      value: `${kpis.savings_rate}%`,
      subText: `Surplus Ratio`,
      icon: Percent,
      compKey: 'savings_rate',
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400',
    },
    {
      title: 'Avg Monthly Spending',
      value: formatINR(kpis.avg_monthly_spending),
      subText: `Daily Avg: ${formatINR(kpis.avg_daily_spending)}`,
      icon: Calendar,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Budget Utilization',
      value: `${kpis.budget_utilization_pct}%`,
      subText: `Goal Progress: ${kpis.goal_completion_pct}%`,
      icon: PieChart,
      color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Financial Health Score',
      value: `${kpis.health_score || 75.0}`,
      subText: `Grade: ${kpis.health_grade || 'B'}`,
      icon: Target,
      color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-3xl bg-gradient-to-br border backdrop-blur-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className="p-2 rounded-2xl bg-bg-card/50 border border-white/10 shadow-sm">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <h3 className="text-2xl font-black text-white tracking-tight">{card.value}</h3>
              {card.compKey && renderBadge(card.compKey, card.isInverse)}
            </div>
            
            <p className="text-[11px] text-slate-400 mt-1 font-mono">{card.subText}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;
