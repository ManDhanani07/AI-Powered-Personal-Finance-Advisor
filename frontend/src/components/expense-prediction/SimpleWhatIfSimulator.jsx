import React, { useState } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const SimpleWhatIfSimulator = ({ currentPrediction = 0 }) => {
  const [adjustmentPct, setAdjustmentPct] = useState(0);

  const baseAmount = Number(currentPrediction || 0);
  const multiplier = 1 + adjustmentPct / 100;
  const simulatedExpense = Math.max(0, Math.round(baseAmount * multiplier));
  const difference = Math.abs(simulatedExpense - baseAmount);

  return (
    <div className="h-full rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-glass backdrop-blur-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-outfit">
              What if my spending changes?
            </h3>
            <p className="text-[11px] text-slate-400 font-outfit">
              Interactive lifestyle adjustment calculation
            </p>
          </div>
        </div>

        {adjustmentPct !== 0 && (
          <button
            onClick={() => setAdjustmentPct(0)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-outfit transition-colors cursor-pointer"
            title="Reset slider"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-4 pt-1">
        {/* Current Prediction Display */}
        <div className="flex items-center justify-between text-xs font-outfit">
          <span className="text-slate-400">Current prediction</span>
          <span className="font-mono font-bold text-slate-300">
            {formatCurrency(baseAmount)}
          </span>
        </div>

        {/* Interactive Adjustment Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-outfit font-medium">
            <span className="text-slate-400">Spending adjustment</span>
            <span
              className={`font-mono font-bold ${
                adjustmentPct < 0
                  ? 'text-emerald-400'
                  : adjustmentPct > 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {adjustmentPct > 0 ? `+${adjustmentPct}%` : `${adjustmentPct}%`}
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={adjustmentPct}
              onChange={(e) => setAdjustmentPct(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
              <span>-20%</span>
              <span>0%</span>
              <span>+20%</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-outfit">Simulated expense</div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {formatCurrency(simulatedExpense)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-outfit">Potential difference</div>
            <div
              className={`text-base sm:text-lg font-black font-mono ${
                adjustmentPct < 0
                  ? 'text-emerald-400'
                  : adjustmentPct > 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {adjustmentPct === 0 ? '₹0' : `${adjustmentPct > 0 ? '+' : '-'}${formatCurrency(difference)}`}
            </div>
          </div>
        </div>

        {/* Label Note */}
        <div className="text-[11px] text-slate-500 font-outfit text-center pt-1">
          <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold text-slate-400 mr-1.5">
            Simulation
          </span>
          <span>Temporary calculation with zero database writes.</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleWhatIfSimulator;
