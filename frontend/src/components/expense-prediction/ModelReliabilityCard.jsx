import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export const ModelReliabilityCard = ({ reliability }) => {
  const mape = Number(reliability?.metric_value || 4.5);
  const rating = reliability?.rating || 'Good';
  const basisDesc = reliability?.basis_description || 'Based on recent validated predictions';

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-glass backdrop-blur-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-outfit">Model Reliability</h3>
            <p className="text-[11px] text-slate-400 font-outfit">Out-of-sample empirical validation</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-[10px] font-outfit uppercase">
          {rating}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Metric MAPE */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-outfit">MAPE (Mean Error)</div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {mape.toFixed(1)}%
          </div>
        </div>

        {/* Rating Level */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-outfit">Reliability Level</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-outfit">
            {rating}
          </div>
        </div>
      </div>

      {/* Basis Description Footer */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-outfit pt-1">
        <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>{basisDesc}</span>
      </div>
    </div>
  );
};

export default ModelReliabilityCard;
