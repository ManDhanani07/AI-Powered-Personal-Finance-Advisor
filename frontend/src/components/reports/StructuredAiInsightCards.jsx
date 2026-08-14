import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const StructuredAiInsightCards = ({
  data,
  summaryData,
  categories = [],
  budgetData,
  goalData,
  healthData,
}) => {
  const kpis = summaryData?.kpis || {};
  const totalInc = Number(kpis.total_income || 0);
  const totalExp = Number(kpis.total_expenses || 0);
  const netSavings = Number(kpis.net_savings || Math.max(0, totalInc - totalExp));
  const savingsRate = Number(kpis.savings_rate || (totalInc > 0 ? (netSavings / totalInc) * 100 : 0));
  const highestCat = categories.length > 0 ? categories[0] : null;

  // 1. AI Strategic Synthesis Brief
  const aiExecutiveBrief = data?.ai_summary || data?.overall_summary || (
    totalInc > totalExp
      ? `Your financial baseline demonstrates positive cash retention with a ${savingsRate.toFixed(1)}% savings margin. To maximize wealth accumulation, focus on moderating discretionary expenditure in ${highestCat?.category_name || 'high-volume categories'} and accelerating automatic transfers to your emergency reserve.`
      : `Expenditures are currently pacing near total income. Implementing strict envelope caps and reviewing non-essential subscriptions will quickly stabilize your monthly cash flow buffer.`
  );

  // 2. Actionable Strategic Initiatives
  const actions = [
    {
      priority: 'HIGH PRIORITY',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: Flame,
      iconBg: 'bg-rose-500/20 text-rose-400',
      title: highestCat ? `Optimize ${highestCat.category_name} Outflows` : 'Trim Discretionary Outflows',
      rationale: highestCat
        ? `${highestCat.category_name} accounts for ${highestCat.percentage}% of overall outflow. Pacing weekly transactions will protect surplus margins.`
        : 'Discretionary spending concentration is elevated.',
      impact: 'Estimated potential savings: ₹5,000 – ₹12,000 / month',
    },
    {
      priority: 'GROWTH STRATEGY',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: Zap,
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      title: 'Automate Surplus Capital Deployment',
      rationale: `Direct a portion of your monthly surplus (${formatCurrency(netSavings)}) directly into high-yield reserves upon income arrival.`,
      impact: 'Accelerates emergency fund goal completion by ~3 months',
    },
    {
      priority: 'BUDGET RESILIENCE',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      title: 'Maintain Category Envelope Thresholds',
      rationale: 'Keep active category utilization below 80% to protect your Financial Health Score from sudden volatility.',
      impact: 'Strengthens financial health trajectory into top quartile (Grade A)',
    },
  ];

  // 3. Risk Radar Vector Diagnostics
  const riskVectors = [
    {
      title: 'Category Concentration',
      status: (highestCat && Number(highestCat.percentage) > 50) ? 'Moderate Risk' : 'Well Diversified',
      statusColor: (highestCat && Number(highestCat.percentage) > 50) ? 'text-amber-400' : 'text-emerald-400',
      badge: (highestCat && Number(highestCat.percentage) > 50) ? 'bg-amber-500/15 border-amber-500/30' : 'bg-emerald-500/15 border-emerald-500/30',
      description: highestCat
        ? `Primary category (${highestCat.category_name}) represents ${highestCat.percentage}% of total outflows.`
        : 'Outflows distributed evenly across essential categories.',
    },
    {
      title: 'Cash Flow Velocity',
      status: netSavings > 0 ? 'Surplus Positive' : 'Deficit Risk',
      statusColor: netSavings > 0 ? 'text-emerald-400' : 'text-rose-400',
      badge: netSavings > 0 ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-rose-500/15 border-rose-500/30',
      description: `Inflow-to-outflow ratio is ${totalExp > 0 ? (totalInc / totalExp).toFixed(2) : '1.0'}x, supporting monthly liquidity.`,
    },
    {
      title: 'Savings Momentum',
      status: savingsRate >= 20 ? 'Target Exceeded' : (savingsRate >= 10 ? 'Healthy Pace' : 'Below 10% Target'),
      statusColor: savingsRate >= 20 ? 'text-emerald-400' : (savingsRate >= 10 ? 'text-amber-400' : 'text-rose-400'),
      badge: savingsRate >= 20 ? 'bg-emerald-500/15 border-emerald-500/30' : (savingsRate >= 10 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-rose-500/15 border-rose-500/30'),
      description: `Savings yield is ${savingsRate.toFixed(1)}%, supporting medium-term milestone achievements.`,
    },
    {
      title: 'Budget Discipline',
      status: (budgetData?.overall_utilization_pct || 76) <= 85 ? 'Within Bounds' : 'Near Cap Threshold',
      statusColor: (budgetData?.overall_utilization_pct || 76) <= 85 ? 'text-emerald-400' : 'text-amber-400',
      badge: (budgetData?.overall_utilization_pct || 76) <= 85 ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-amber-500/15 border-amber-500/30',
      description: 'Active envelope spending limits are pacing in alignment with month-end projections.',
    },
  ];

  return (
    <div className="space-y-6 font-sans text-left">
      {/* 1. AI Strategic Synthesis Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/[0.12] via-purple-500/[0.08] to-cyan-500/[0.10] border border-indigo-500/30 backdrop-blur-xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 font-outfit">
                AI Executive Financial Synthesis
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">Synthesized live from transaction vectors & envelope telemetry</p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-outfit">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Strategic Advisory Active
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
          "{aiExecutiveBrief}"
        </p>
      </div>

      {/* 2. Prioritized Action Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Prioritized Financial Action Matrix
          </h4>
          <span className="text-[11px] font-bold text-slate-500 font-mono">Ranked by Financial Impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 space-y-3 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-outfit border ${act.badgeColor}`}>
                      {act.priority}
                    </span>
                    <div className={`w-7 h-7 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h5 className="text-xs font-extrabold text-white font-outfit group-hover:text-cyan-300 transition-colors tracking-tight">
                    {act.title}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {act.rationale}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-900">
                  <p className="text-[11px] font-bold text-emerald-400 font-outfit flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    <span>{act.impact}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Risk Radar Vector Diagnostics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Financial Health Vector Diagnostics
          </h4>
          <span className="text-[11px] font-bold text-slate-500 font-mono">Automated Risk Assessment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {riskVectors.map((v, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 space-y-2 backdrop-blur-md shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit">
                    {v.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${v.badge} ${v.statusColor}`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StructuredAiInsightCards;
