import React from 'react';
import { PieChart, Landmark, ShoppingBag, Utensils, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const TierExpenseBreakdown = ({ summary }) => {
  const fixed = Number(summary?.fixed_bills || summary?.recurring_bills || 0);
  const routine = Number(summary?.routine_spend || 0);
  const disc = Number(summary?.disc_spend || 0);
  const shock = Number(summary?.shock_amount || 0);
  const total = fixed + routine + disc + shock || 1;

  const fixedPct = ((fixed / total) * 100).toFixed(0);
  const routinePct = ((routine / total) * 100).toFixed(0);
  const discPct = ((disc / total) * 100).toFixed(0);
  const shockPct = ((shock / total) * 100).toFixed(0);

  const tiers = [
    {
      title: 'Tier 1: Fixed Contractual Liabilities',
      subtitle: 'Rent, EMI, Utilities, Insurance, Subscriptions',
      amount: fixed,
      pct: fixedPct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      bgBox: 'bg-emerald-500/10',
      icon: Landmark,
      precision: 'Contractual Bills (100% Exact)',
    },
    {
      title: 'Tier 2: Essential Routine Living',
      subtitle: 'Food & Dining, Groceries, Daily Transit, Personal Care',
      amount: routine,
      pct: routinePct,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
      bgBox: 'bg-cyan-500/10',
      icon: Utensils,
      precision: 'Essential Daily Living',
    },
    {
      title: 'Tier 3: Elastic Discretionary Outflows',
      subtitle: 'Shopping, Electronics, Trips, Entertainment',
      amount: disc,
      pct: discPct,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      bgBox: 'bg-purple-500/10',
      icon: ShoppingBag,
      precision: 'Flexible Lifestyle Spend',
    },
    {
      title: 'Tier 4: Isolated Irregular Shocks',
      subtitle: 'Medical emergencies, unexpected vehicle repairs',
      amount: shock,
      pct: shockPct,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      bgBox: 'bg-rose-500/10',
      icon: AlertTriangle,
      precision: 'One-Off / Non-Recurring',
    },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">
              Hierarchical 3-Tier Spending Decomposition
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Decomposes total expenditure to separate fixed liabilities from elastic lifestyle demand.
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Visual Stack Bar */}
      <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden flex">
        <div style={{ width: `${fixedPct}%` }} className="h-full bg-emerald-500 transition-all" title={`Fixed: ${fixedPct}%`} />
        <div style={{ width: `${routinePct}%` }} className="h-full bg-cyan-500 transition-all" title={`Routine: ${routinePct}%`} />
        <div style={{ width: `${discPct}%` }} className="h-full bg-purple-500 transition-all" title={`Discretionary: ${discPct}%`} />
        <div style={{ width: `${shockPct}%` }} className="h-full bg-rose-500 transition-all" title={`Shocks: ${shockPct}%`} />
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {tiers.map((t, idx) => {
          const IconComp = t.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${t.borderColor} ${t.bgBox} space-y-2`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg bg-zinc-900 ${t.textColor}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-outfit">{t.title}</h4>
                    <p className="text-[10px] text-slate-400">{t.subtitle}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black font-mono ${t.textColor} bg-zinc-900`}>
                  {t.pct}%
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
                <span className="text-lg font-black text-white font-outfit">
                  {formatCurrency(t.amount)}
                </span>
                <span className="text-[10px] font-medium text-slate-400 font-mono">
                  {t.precision}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TierExpenseBreakdown;
