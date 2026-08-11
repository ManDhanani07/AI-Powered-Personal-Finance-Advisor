import React from 'react';
import { ShieldCheck, Zap, Scale, Activity, Award } from 'lucide-react';

export const ExecutiveRatios = ({ kpis }) => {
  if (!kpis) return null;

  const totalInc = kpis.total_income || 0;
  const totalExp = kpis.total_expenses || 0;
  const netSavings = kpis.net_savings || 0;

  // Financial Ratio Calculations
  const savingsRatio = totalInc > 0 ? ((netSavings / totalInc) * 100).toFixed(1) : 0;
  const expenseRatio = totalInc > 0 ? ((totalExp / totalInc) * 100).toFixed(1) : 0;
  const emergencyCoverageMonths = totalExp > 0 ? (netSavings / (totalExp / 12)).toFixed(1) : 'N/A';

  let healthGrade = 'A';
  let healthStatus = 'Excellent';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (savingsRatio < 10) {
    healthGrade = 'C';
    healthStatus = 'Needs Attention';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (savingsRatio < 20) {
    healthGrade = 'B';
    healthStatus = 'Moderate Control';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const ratios = [
    {
      title: 'Savings Ratio',
      value: `${savingsRatio}%`,
      benchmark: '> 20%',
      status: savingsRatio >= 20 ? 'Optimal' : 'Low',
      statusColor: savingsRatio >= 20 ? 'text-emerald-400' : 'text-amber-400',
      icon: Scale,
      desc: 'Percentage of net income retained as savings.',
    },
    {
      title: 'Expense Burn',
      value: `${expenseRatio}%`,
      benchmark: '< 80%',
      status: expenseRatio <= 80 ? 'Controlled' : 'High',
      statusColor: expenseRatio <= 80 ? 'text-emerald-400' : 'text-rose-400',
      icon: Activity,
      desc: 'Percentage of income consumed by expenses.',
    },
    {
      title: 'Liquidity Buffer',
      value: `${emergencyCoverageMonths} Mos`,
      benchmark: '3-6 Months',
      status: Number(emergencyCoverageMonths) >= 3 ? 'Resilient' : 'Building',
      statusColor: Number(emergencyCoverageMonths) >= 3 ? 'text-emerald-400' : 'text-amber-400',
      icon: ShieldCheck,
      desc: 'Living expenses covered by liquid reserves.',
    },
    {
      title: 'Financial Grade',
      value: `Grade ${healthGrade}`,
      benchmark: healthStatus,
      status: 'Verified Engine',
      statusColor: 'text-emerald-400',
      icon: Award,
      desc: 'Weighted evaluation across key metrics.',
    },
  ];

  return (
    <div className="bg-[#09090B] border border-zinc-800 p-6 rounded-2xl shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">Executive Ratio Diagnostics</h3>
            <p className="text-xs text-slate-400">Institutional financial health &amp; risk indicators</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
          {healthStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ratios.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#000000] border border-zinc-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">{item.title}</span>
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-outfit">{item.value}</div>
              <div className="flex items-center justify-between text-[11px] mt-2">
                <span className="text-slate-500 font-mono">{item.benchmark}</span>
                <span className={`font-extrabold ${item.statusColor}`}>{item.status}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveRatios;
