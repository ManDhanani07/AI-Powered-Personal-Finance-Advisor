import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { formatCompactFinancial } from '../../utils/formatters.js';

const CARDS = [
  {
    key: 'total_balance',
    label: 'Total Net Worth',
    icon: Wallet,
    iconBg: 'bg-indigo-500/10 border border-indigo-500/20',
    iconColor: 'text-indigo-400',
    trendKey: null,
  },
  {
    key: 'monthly_income',
    label: 'Monthly Income',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    iconColor: 'text-emerald-400',
    trendKey: 'income_change_pct',
  },
  {
    key: 'monthly_expenses',
    label: 'Monthly Expenses',
    icon: TrendingDown,
    iconBg: 'bg-rose-500/10 border border-rose-500/20',
    iconColor: 'text-rose-400',
    trendKey: 'expense_change_pct',
    invertTrend: true,
  },
  {
    key: 'net_savings',
    label: 'Net Surplus Savings',
    icon: PiggyBank,
    iconBg: 'bg-sky-500/10 border border-sky-500/20',
    iconColor: 'text-sky-400',
    trendKey: 'savings_change_pct',
  },
];

const SkeletonCard = () => (
  <div className="rounded-3xl border border-border-subtle bg-bg-surface p-5 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-800 rounded w-2/3" />
        <div className="h-7 bg-slate-800 rounded w-1/2 mt-2" />
      </div>
      <div className="h-10 w-10 bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

const TrendBadge = ({ value, invert = false }) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  const isPositive = invert ? num <= 0 : num >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold rounded-full px-2 py-0.5 ${
        isPositive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}
    >
      {num >= 0 ? '↑' : '↓'} {Math.abs(num).toFixed(1)}%
    </span>
  );
};

export const OverviewCards = ({ overview, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS.map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const rawValue = overview?.[card.key] ?? 0;
        const numValue = Number(rawValue);
        const trendValue = card.trendKey ? overview?.[card.trendKey] : null;

        const displayValue = formatCompactFinancial(numValue);
        const isNegative = numValue < 0;

        return (
          <div
            key={card.key}
            className="group rounded-3xl bg-[#09090B] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.98)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-outfit">
                {card.label}
              </p>
              <div className={`p-2.5 rounded-2xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>

            <p className={`text-2xl sm:text-3xl font-black font-outfit tracking-tight ${
              isNegative ? 'text-rose-400' : 'text-white'
            }`}>
              {displayValue}
            </p>

            {trendValue !== null && trendValue !== undefined && (
              <div className="mt-2.5 flex items-center gap-2">
                <TrendBadge value={trendValue} invert={card.invertTrend} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards;
