import React from 'react';
import { CalendarClock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const UpcomingRecurringCard = ({ recurringExpenses = [], totalRecurringAmount = 0 }) => {
  const hasRecurring = Array.isArray(recurringExpenses) && recurringExpenses.length > 0;
  const totalAmt = Number(
    totalRecurringAmount || (hasRecurring ? recurringExpenses.reduce((s, r) => s + (r.amount || 0), 0) : 0)
  );

  return (
    <div className="h-full rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-glass backdrop-blur-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-outfit">Upcoming recurring expenses</h3>
            <p className="text-[11px] text-slate-400 font-outfit">Contractual bills & subscriptions</p>
          </div>
        </div>

        {hasRecurring && (
          <span className="text-xs font-mono font-bold text-emerald-400">
            {formatCurrency(totalAmt)}
          </span>
        )}
      </div>

      {hasRecurring ? (
        <div className="space-y-2.5 pt-1">
          <div className="divide-y divide-zinc-800/60 max-h-52 overflow-y-auto pr-1">
            {recurringExpenses.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs font-outfit">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-300 font-medium">
                    {item.name || item.merchant || item.category || 'Recurring bill'}
                  </span>
                </div>
                <span className="font-mono text-slate-200 font-bold">
                  {formatCurrency(item.amount || 0)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-outfit">
            <span className="text-slate-400 font-medium">Expected recurring total</span>
            <span className="font-mono text-white font-black text-sm">
              {formatCurrency(totalAmt)}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500 font-outfit">
            No recurring expenses detected.
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingRecurringCard;
