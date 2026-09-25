import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles, RefreshCw, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const ScenarioSimulatorCard = ({
  onRunSimulation,
  onResetSimulation,
  isSimulated,
  simulating,
  targetMonth,
  onChangeTargetMonth,
  baselineIncome = 0,
  baselineRoutineSpend = 0,
}) => {
  const [incomePct, setIncomePct] = useState(0);
  const [discPct, setDiscPct] = useState(0);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  // Real-time frontend preview calculation
  const simIncome = Math.round(baselineIncome * (1 + incomePct / 100));
  const simSpend = Math.max(0, Math.round(baselineRoutineSpend * (1 + (discPct * 0.35) / 100)));
  const diff = simSpend - baselineRoutineSpend;

  const handleSimulate = (e) => {
    e.preventDefault();
    onRunSimulation({
      income_growth_pct: incomePct,
      discretionary_spend_adj_pct: discPct,
    });
  };

  const handleReset = () => {
    setIncomePct(0);
    setDiscPct(0);
    onResetSimulation();
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-6 shadow-glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
                What-If Expense Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-outfit bg-amber-500/20 border border-amber-500/40 text-amber-300">
                Simulation Only
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Test impact of income raises, bonus allocations, or discretionary budget cuts without modifying database records
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 font-outfit">Forecast Horizon:</span>
          <select
            value={targetMonth || ''}
            onChange={(e) => onChangeTargetMonth(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-outfit"
          >
            <option value="">Next Calendar Month</option>
            {months.map((m) => (
              <option key={m.num} value={m.num}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sliders Form */}
      <form onSubmit={handleSimulate} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Growth Slider */}
          <div className="space-y-2 rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 font-outfit">Monthly Income Variation:</span>
              <span className={`font-mono font-black ${incomePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {incomePct > 0 ? `+${incomePct}%` : `${incomePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={incomePct}
              onChange={(e) => setIncomePct(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50% (Loss)</span>
              <span>Baseline (0%)</span>
              <span>+100% (2x Raise)</span>
            </div>
          </div>

          {/* Discretionary Cut Slider */}
          <div className="space-y-2 rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 font-outfit">Discretionary Spend Adjustment:</span>
              <span className={`font-mono font-black ${discPct <= 0 ? 'text-cyan-400' : 'text-purple-400'}`}>
                {discPct > 0 ? `+${discPct}%` : `${discPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={discPct}
              onChange={(e) => setDiscPct(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-60% (Frugal)</span>
              <span>Baseline (0%)</span>
              <span>+60% (Surge)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-outfit">Current Baseline</span>
            <p className="text-base font-black font-mono text-slate-200 mt-0.5">
              {formatCurrency(baselineRoutineSpend)}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-outfit">Simulated Forecast</span>
            <p className="text-base font-black font-mono text-amber-300 mt-0.5">
              {formatCurrency(simSpend)}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-outfit">Projected Variance</span>
            <p
              className={`text-base font-black font-mono mt-0.5 ${
                diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
            </p>
          </div>
        </div>

        {/* Action Buttons & Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Simulation does not alter real transactions, ledger records, or account balances.</span>
          </div>

          <div className="flex items-center space-x-3">
            {isSimulated && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer font-outfit flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            )}

            <button
              type="submit"
              disabled={simulating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 font-outfit"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Simulation Scenario</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScenarioSimulatorCard;
