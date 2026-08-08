import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

const GRADE_CONFIG = {
  'A+': { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Tier 1 Prime' },
  'A': { bg: 'from-emerald-600 to-green-600', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Tier 1 Strong' },
  'B+': { bg: 'from-primary-500 to-blue-600', text: 'text-primary-400', border: 'border-primary-500/30', label: 'Tier 2 Very Good' },
  'B': { bg: 'from-primary-600 to-indigo-600', text: 'text-primary-400', border: 'border-primary-500/30', label: 'Tier 2 Good' },
  'C': { bg: 'from-amber-500 to-orange-600', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Tier 3 Fair' },
  'D': { bg: 'from-orange-500 to-rose-600', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Tier 4 Vulnerable' },
  'F': { bg: 'from-rose-600 to-red-700', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Tier 5 Critical' },
  'N/A': { bg: 'from-slate-700 to-slate-800', text: 'text-slate-400', border: 'border-slate-700/50', label: 'Unrated (0 Tx)' },
};

export const GradeCard = ({ grade = 'B', summary = '' }) => {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG['B'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`rounded-3xl border ${config.border} bg-bg-surface p-6 shadow-glass flex flex-col justify-between space-y-4 relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit">
          Financial Health Rating
        </span>
        <span className={`px-2.5 py-0.5 rounded-full bg-bg-elevated ${config.text} text-[10px] font-extrabold uppercase border border-border-subtle`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-center space-x-5 my-2">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-white font-black text-4xl font-outfit shadow-xl group-hover:scale-105 transition-transform`}>
          {grade}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-white font-outfit">
            Grade {grade} Standing
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {summary || 'Calculated dynamically from PostgreSQL ledger history.'}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-slate-400">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL Rule Engine Verified</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GradeCard;
