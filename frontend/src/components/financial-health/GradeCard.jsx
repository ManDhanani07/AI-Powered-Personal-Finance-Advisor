import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const GRADE_CONFIG = {
  'A+': { bg: 'from-emerald-400 to-teal-500', text: 'text-emerald-400', label: 'Tier 1 Prime' },
  'A':  { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', label: 'Tier 1 Strong' },
  'B+': { bg: 'from-teal-500 to-cyan-500',   text: 'text-teal-400',    label: 'Tier 2 Very Good' },
  'B':  { bg: 'from-teal-600 to-cyan-600',   text: 'text-teal-400',    label: 'Tier 2 Good' },
  'C':  { bg: 'from-amber-500 to-orange-500',text: 'text-amber-400',   label: 'Tier 3 Fair' },
  'D':  { bg: 'from-orange-500 to-rose-500', text: 'text-rose-400',    label: 'Tier 4 Vulnerable' },
  'F':  { bg: 'from-rose-600 to-red-600',    text: 'text-rose-400',    label: 'Tier 5 Critical' },
  'N/A':{ bg: 'from-zinc-800 to-zinc-900',   text: 'text-slate-400',   label: 'Unrated (0 Tx)' },
};

export const GradeCard = ({ grade = 'B', summary = '' }) => {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG['B'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-zinc-800 bg-[#09090B] p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit">
          Financial Health Rating
        </span>
        <span className={`px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 ${config.text} text-[10px] font-extrabold uppercase font-outfit`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-center space-x-5 my-2">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-slate-950 font-black text-4xl font-outfit shadow-md group-hover:scale-105 transition-transform`}>
          {grade}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-white font-outfit">
            Grade {grade} Standing
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {summary || 'Calculated dynamically from PostgreSQL ledger history.'}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-400">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL Rule Engine Verified</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GradeCard;
