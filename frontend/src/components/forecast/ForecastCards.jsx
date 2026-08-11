import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const ForecastCards = ({ insights, accuracyMetrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-3xl bg-[#09090B] p-5 space-y-3 shadow-md">
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
            <div className="h-8 bg-zinc-800 rounded-xl w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const expMonthly = Number(insights?.expected_monthly_expense ?? 0);
  const incMonthly = Number(insights?.expected_monthly_income ?? 0);
  const savMonthly = Number(insights?.expected_savings ?? 0);
  const balMonthly = Number(insights?.expected_balance ?? 0);

  const cards = [
    {
      title: 'Expected Monthly Income',
      amount: incMonthly,
      trendPct: Number(insights?.income_trend_pct ?? 0),
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
      isPositive: true,
    },
    {
      title: 'Expected Monthly Expense',
      amount: expMonthly,
      trendPct: Number(insights?.expense_trend_pct ?? 0),
      icon: TrendingDown,
      iconBg: 'bg-rose-500/20 text-rose-400',
      badgeColor: 'bg-rose-500/10 text-rose-400',
      isPositive: false,
    },
    {
      title: 'Expected Monthly Savings',
      amount: savMonthly,
      trendPct: Number(insights?.growth_trend_pct ?? 0),
      icon: DollarSign,
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      badgeColor: 'bg-indigo-500/10 text-indigo-400',
      isPositive: true,
    },
    {
      title: 'Projected Account Balance',
      amount: balMonthly,
      trendPct: Number(insights?.growth_trend_pct ?? 0),
      icon: Wallet,
      iconBg: 'bg-amber-500/20 text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400',
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const ArrowIcon = card.isPositive ? ArrowUpRight : ArrowDownRight;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="rounded-3xl border border-zinc-800 bg-[#09090B] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{card.title}</span>
              <div className={`p-2.5 rounded-2xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white font-outfit tracking-tight">
                {formatCurrency(card.amount)}
              </h3>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-zinc-800">
              <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold ${card.badgeColor}`}>
                <ArrowIcon className="w-3 h-3" />
                <span>{card.trendPct}%</span>
              </div>
              <span className="text-slate-400">Meta Prophet Model</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ForecastCards;
