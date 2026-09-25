import React from 'react';
import { History, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const LastPredictionCard = ({ validation }) => {
  const hasVal = Boolean(validation && validation.has_validation);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-glass backdrop-blur-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-outfit">Last Prediction</h3>
            <p className="text-[11px] text-slate-400 font-outfit">
              {hasVal && validation.forecast_month_name
                ? `Performance for ${validation.forecast_month_name}`
                : 'Previous monthly forecast validation'}
            </p>
          </div>
        </div>

        {hasVal && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] font-outfit uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{validation.status_label || 'Validated'}</span>
          </span>
        )}
      </div>

      {hasVal ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Predicted */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-outfit">Predicted</div>
            <div className="text-base sm:text-lg font-black text-slate-200 font-mono">
              {formatCurrency(validation.predicted_amount || 0)}
            </div>
          </div>

          {/* Actual */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-outfit">Actual</div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {formatCurrency(validation.actual_amount || 0)}
            </div>
          </div>

          {/* Difference */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-outfit">Difference</div>
            <div className="text-sm sm:text-base font-bold text-slate-300 font-mono">
              {formatCurrency(validation.difference || 0)}
            </div>
          </div>

          {/* Prediction Error */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-outfit">Prediction error</div>
            <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
              {Number(validation.error_pct || 0).toFixed(1)}%
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400 font-outfit max-w-xs mx-auto">
            Previous prediction validation requires at least 2 completed months of historical records.
          </p>
        </div>
      )}
    </div>
  );
};

export default LastPredictionCard;
