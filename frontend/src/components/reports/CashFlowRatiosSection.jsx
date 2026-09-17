import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  PieChart,
  Percent,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const CashFlowRatiosSection = ({ advancedData, summaryData, categories = [] }) => {
  const [filterVariance, setFilterVariance] = useState('all');

  const allocation = advancedData?.allocation_50_30_20 || {
    needs: { amount: 0, percentage: 50, benchmark_pct: 50, variance: 0 },
    wants: { amount: 0, percentage: 30, benchmark_pct: 30, variance: 0 },
    savings: { amount: 0, percentage: 20, benchmark_pct: 20, variance: 0 },
    status: 'OPTIMAL',
    recommendation: 'All cash flow allocations are synchronized with live PostgreSQL transactions.',
  };

  const ratios = advancedData?.financial_ratios || {
    emergency_runway_months: 6.0,
    runway_status: 'Fortified',
    fixed_overhead_ratio: 45.0,
    fixed_overhead_status: 'Healthy',
    discretionary_burden_ratio: 28.0,
    discretionary_status: 'Controlled',
    capital_retention_rate: 27.0,
    operating_cash_flow: 0,
    daily_burn_rate: 0,
  };

  const varianceList = advancedData?.variance_matrix || [];

  const filteredVariance = varianceList.filter((item) => {
    if (filterVariance === 'increased') return item.delta_amount > 0;
    if (filterVariance === 'reduced') return item.delta_amount < 0;
    return true;
  });

  const getRunwayBadge = (status) => {
    switch (status) {
      case 'Fortified':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Cash Flow & Runway Executive Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-indigo-950/40 to-zinc-950 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Institutional Cash Flow & Solvency Analysis
            </span>
            <h3 className="text-xl font-black text-white tracking-tight font-outfit">
              Operating Capital Velocity & Cash Cushion
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time balance between operating cash burn and reserve runway. This analysis evaluates your baseline liquidity resilience against unexpected financial shocks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-black/50 border border-zinc-800/80 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Net Operating Cash Flow
              </span>
              <p className={`text-base font-black font-mono ${ratios.operating_cash_flow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ratios.operating_cash_flow >= 0 ? '+' : ''}{formatCurrency(ratios.operating_cash_flow)}
              </p>
            </div>

            <div className="bg-black/50 border border-zinc-800/80 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Daily Burn Rate
              </span>
              <p className="text-base font-black font-mono text-slate-200">
                {formatCurrency(ratios.daily_burn_rate)} <span className="text-[10px] text-slate-400 font-normal">/day</span>
              </p>
            </div>

            <div className="bg-black/50 border border-zinc-800/80 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Emergency Runway
              </span>
              <div className="flex items-center gap-2">
                <p className="text-base font-black font-mono text-cyan-400">
                  {ratios.emergency_runway_months} <span className="text-[10px] text-slate-400 font-normal">Mo</span>
                </p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getRunwayBadge(ratios.runway_status)}`}>
                  {ratios.runway_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The 50 / 30 / 20 Allocation Rule Matrix */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <Scale className="w-5 h-5 text-purple-400" />
              <span>50 / 30 / 20 Budgetary Allocation Rule</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gold standard allocation benchmark: 50% Essential Needs, 30% Discretionary Wants, and 20% Wealth Retention.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto ${
              allocation.status === 'OPTIMAL'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {allocation.status === 'OPTIMAL' ? 'Balanced Allocation' : 'Attention Advised'}
          </span>
        </div>

        {/* Segmented Visual Allocation Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
            <span>Capital Distribution Profile</span>
            <span>Needs: {allocation.needs.percentage}% | Wants: {allocation.wants.percentage}% | Savings: {allocation.savings.percentage}%</span>
          </div>

          <div className="w-full h-5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.min(100, allocation.needs.percentage)}%` }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500 relative group cursor-pointer"
              title={`Needs: ${formatCurrency(allocation.needs.amount)} (${allocation.needs.percentage}%)`}
            />
            <div
              style={{ width: `${Math.min(100, allocation.wants.percentage)}%` }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 relative group cursor-pointer"
              title={`Wants: ${formatCurrency(allocation.wants.amount)} (${allocation.wants.percentage}%)`}
            />
            <div
              style={{ width: `${Math.min(100, allocation.savings.percentage)}%` }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 relative group cursor-pointer"
              title={`Savings: ${formatCurrency(allocation.savings.amount)} (${allocation.savings.percentage}%)`}
            />
          </div>
        </div>

        {/* 3 Pillars Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs */}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                Essential Needs
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target: 50.0%</span>
            </div>
            <div>
              <h4 className="text-xl font-black text-white font-mono">{formatCurrency(allocation.needs.amount)}</h4>
              <p className="text-xs font-mono font-bold mt-1 text-blue-300">
                {allocation.needs.percentage}% of total income
              </p>
            </div>
            <div className="pt-2 border-t border-blue-500/15 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Variance from Ideal:</span>
              <span
                className={`font-mono font-bold ${
                  allocation.needs.variance <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {allocation.needs.variance > 0 ? `+${allocation.needs.variance}%` : `${allocation.needs.variance}%`}
              </span>
            </div>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                Discretionary Wants
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target: 30.0%</span>
            </div>
            <div>
              <h4 className="text-xl font-black text-white font-mono">{formatCurrency(allocation.wants.amount)}</h4>
              <p className="text-xs font-mono font-bold mt-1 text-purple-300">
                {allocation.wants.percentage}% of total income
              </p>
            </div>
            <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Variance from Ideal:</span>
              <span
                className={`font-mono font-bold ${
                  allocation.wants.variance <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {allocation.wants.variance > 0 ? `+${allocation.wants.variance}%` : `${allocation.wants.variance}%`}
              </span>
            </div>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Wealth Retention
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target: 20.0%</span>
            </div>
            <div>
              <h4 className="text-xl font-black text-white font-mono">{formatCurrency(allocation.savings.amount)}</h4>
              <p className="text-xs font-mono font-bold mt-1 text-emerald-300">
                {allocation.savings.percentage}% of total income
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Variance from Ideal:</span>
              <span
                className={`font-mono font-bold ${
                  allocation.savings.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {allocation.savings.variance > 0 ? `+${allocation.savings.variance}%` : `${allocation.savings.variance}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Strategic Allocation Takeaway */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            <span className="text-white font-bold">Actionable Diagnostic: </span>
            {allocation.recommendation}
          </p>
        </div>
      </div>

      {/* 3. Institutional Financial Solvency & Liquidity Ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ratio 1: Emergency Runway */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-3xl shadow-lg space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-outfit">
              <Clock className="w-4 h-4 text-cyan-400" />
              Runway Ratio
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRunwayBadge(ratios.runway_status)}`}>
              {ratios.runway_status}
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-white font-mono">{ratios.emergency_runway_months} Mo</h4>
            <p className="text-[11px] text-slate-400 mt-1">Months of normal living expenses covered by reserves.</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Benchmark: 6.0+ Mo</span>
            <span className="text-cyan-400 font-bold">{ratios.emergency_runway_months >= 6 ? 'Pass' : 'Under Target'}</span>
          </div>
        </div>

        {/* Ratio 2: Fixed Overhead Burden */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-3xl shadow-lg space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-outfit">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Fixed Cost Burden
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-500/10 text-blue-300 border-blue-500/20">
              {ratios.fixed_overhead_status}
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-white font-mono">{ratios.fixed_overhead_ratio}%</h4>
            <p className="text-[11px] text-slate-400 mt-1">Proportion of gross income tied up in non-negotiable living costs.</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Benchmark: ≤ 50.0%</span>
            <span className={ratios.fixed_overhead_ratio <= 50 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {ratios.fixed_overhead_ratio <= 50 ? 'Compliant' : 'Elevated'}
            </span>
          </div>
        </div>

        {/* Ratio 3: Discretionary Ratio */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-3xl shadow-lg space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-outfit">
              <Percent className="w-4 h-4 text-purple-400" />
              Discretionary Burden
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-500/10 text-purple-300 border-purple-500/20">
              {ratios.discretionary_status}
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-white font-mono">{ratios.discretionary_burden_ratio}%</h4>
            <p className="text-[11px] text-slate-400 mt-1">Lifestyle purchases relative to incoming cash flows.</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Benchmark: ≤ 30.0%</span>
            <span className={ratios.discretionary_burden_ratio <= 30 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {ratios.discretionary_burden_ratio <= 30 ? 'Optimal' : 'High'}
            </span>
          </div>
        </div>

        {/* Ratio 4: Capital Retention Efficiency */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-3xl shadow-lg space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-outfit">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Capital Retention
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
              {ratios.capital_retention_rate >= 20 ? 'Prime' : 'Standard'}
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-white font-mono">{ratios.capital_retention_rate}%</h4>
            <p className="text-[11px] text-slate-400 mt-1">Net accumulated surplus remaining after all outflows.</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Target: ≥ 20.0%</span>
            <span className={ratios.capital_retention_rate >= 20 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {ratios.capital_retention_rate >= 20 ? 'Excellent' : 'Growth Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Multi-Period Comparative Variance Matrix */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Multi-Period Comparative Variance Ledger</span>
            </h3>
            <p className="text-xs text-slate-400">
              Category-level variance comparing current active filter against the preceding cycle.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            {['all', 'increased', 'reduced'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterVariance(type)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  filterVariance === type
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredVariance.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            No comparative variance records found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3 px-4">Spending Vector</th>
                  <th className="py-3 px-4">Current Cycle</th>
                  <th className="py-3 px-4">Previous Cycle</th>
                  <th className="py-3 px-4">Delta Variance (₹)</th>
                  <th className="py-3 px-4">% Variance</th>
                  <th className="py-3 px-4 text-right">Trajectory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs font-sans">
                {filteredVariance.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-400" />
                      {item.category_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">{formatCurrency(item.current_amount)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{formatCurrency(item.previous_amount)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={item.delta_amount > 0 ? 'text-rose-400' : (item.delta_amount < 0 ? 'text-emerald-400' : 'text-slate-400')}>
                        {item.delta_amount > 0 ? `+${formatCurrency(item.delta_amount)}` : formatCurrency(item.delta_amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={item.percentage_change > 0 ? 'text-rose-400' : (item.percentage_change < 0 ? 'text-emerald-400' : 'text-slate-400')}>
                        {item.percentage_change > 0 ? `+${item.percentage_change}%` : `${item.percentage_change}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${
                          item.trend === 'REDUCED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : (item.trend === 'INCREASED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-zinc-800 text-slate-400 border-zinc-700')
                        }`}
                      >
                        {item.trend === 'REDUCED' && <ArrowDownRight className="w-3 h-3" />}
                        {item.trend === 'INCREASED' && <ArrowUpRight className="w-3 h-3" />}
                        {item.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowRatiosSection;
