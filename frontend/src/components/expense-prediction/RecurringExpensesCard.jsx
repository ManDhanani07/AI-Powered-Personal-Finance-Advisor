import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calendar, Tag, ShieldCheck, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const RecurringExpensesCard = ({ recurringExpenses, totalRecurringAmount }) => {
  const items = recurringExpenses || [];
  const totalAmt = totalRecurringAmount || items.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
              Recurring & Pattern-Based Outflows
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Detected recurring subscriptions, EMIs, utilities, and contractual obligations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 font-outfit">Expected Recurring:</span>
          <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            {formatCurrency(totalAmt)}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
          <Clock className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-xs font-bold text-slate-300 font-outfit">No Recurring Patterns Detected</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Log periodic expenses like rent, utilities, subscriptions, or EMIs to track upcoming recurring cash deductions.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-outfit">
                <th className="pb-3 pr-4">Obligation / Item</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Next Expected Date</th>
                <th className="pb-3 px-4">Type</th>
                <th className="pb-3 pl-4 text-right">Avg Monthly Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-outfit">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="py-3.5 pr-4 font-bold text-slate-200 group-hover:text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {item.expected_next_date || 'Projected Monthly'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        item.is_contractual
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-slate-300 border-zinc-700'
                      }`}
                    >
                      {item.source || (item.is_contractual ? 'Contractual' : 'Pattern')}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right font-black font-mono text-white">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default RecurringExpensesCard;
