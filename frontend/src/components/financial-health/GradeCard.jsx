import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award } from 'lucide-react';

const GRADE_CONFIG = {
  'A+': { bg: 'from-emerald-400 via-teal-500 to-cyan-500', text: 'text-emerald-400', badge: 'border-emerald-500/30 bg-emerald-500/10', label: 'Tier 1 Prime Standing' },
  'A':  { bg: 'from-emerald-500 via-teal-600 to-cyan-600', text: 'text-emerald-400', badge: 'border-emerald-500/30 bg-emerald-500/10', label: 'Tier 1 Strong Standing' },
  'B+': { bg: 'from-sky-400 via-blue-500 to-indigo-500',    text: 'text-sky-400',     badge: 'border-sky-500/30 bg-sky-500/10',     label: 'Tier 2 Upper Good' },
  'B':  { bg: 'from-sky-500 via-indigo-600 to-violet-600',  text: 'text-indigo-400',  badge: 'border-indigo-500/30 bg-indigo-500/10',  label: 'Tier 2 Solid Standing' },
  'C':  { bg: 'from-amber-400 via-orange-500 to-yellow-500', text: 'text-amber-400',   badge: 'border-amber-500/30 bg-amber-500/10',   label: 'Tier 3 Moderate Standing' },
  'D':  { bg: 'from-orange-500 via-rose-500 to-red-500',    text: 'text-rose-400',    badge: 'border-rose-500/30 bg-rose-500/10',    label: 'Tier 4 Vulnerable Standing' },
  'F':  { bg: 'from-rose-600 via-red-600 to-pink-600',       text: 'text-rose-500',    badge: 'border-rose-500/30 bg-rose-500/10',    label: 'Tier 5 Critical Attention' },
  'N/A':{ bg: 'from-zinc-700 via-zinc-800 to-zinc-900',     text: 'text-slate-400',   badge: 'border-zinc-700 bg-zinc-800/50',        label: 'Unrated (Insufficient Ledger Data)' },
};

export const GradeCard = ({ grade = 'B', summary = '' }) => {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG['B'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="p-4 flex flex-col justify-between space-y-4 h-full"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className={`w-4 h-4 ${config.text}`} />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit">
            Overall Rating Grade
          </span>
        </div>

        <span className={`px-3 py-1 rounded-full border ${config.badge} ${config.text} text-[10px] font-extrabold uppercase font-outfit tracking-wide`}>
          {config.label}
        </span>
      </div>

      {/* Main Grade Display */}
      <div className="flex items-center space-x-6 my-2">
        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-slate-950 font-black text-5xl font-outfit shadow-md flex-shrink-0 border border-white/20`}>
          {grade}
        </div>

        <div className="space-y-1.5 min-w-0">
          <h3 className="text-xl font-black text-white font-outfit flex items-center gap-2">
            Grade {grade} Standing
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {summary || 'Calculated dynamically from PostgreSQL ledger history evaluating savings rate, budget compliance, income stability, and debt capacity.'}
          </p>
        </div>
      </div>

      {/* Verification Footer */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">PostgreSQL Rule Engine Verified</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">7 Parameters Evaluated</span>
      </div>
    </motion.div>
  );
};

export default GradeCard;
