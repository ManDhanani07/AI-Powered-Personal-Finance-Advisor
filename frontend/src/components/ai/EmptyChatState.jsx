import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export const EmptyChatState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center pt-2 pb-2 px-4 text-center space-y-3.5 max-w-2xl mx-auto"
    >
      {/* Landing Theme Pulsing Hero Bot Badge */}
      <div className="relative">
        <div className="absolute -inset-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-30 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
          <Bot className="h-8 w-8 text-slate-950 stroke-[2.5]" />
        </div>
      </div>

      {/* Hero Welcome Typography */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold shadow-sm font-outfit">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time Financial Intelligence</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          How can I assist your wealth today?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-sans">
          Ask questions about your spending patterns, envelope budget limits, savings goals, or request instant transaction logging.
        </p>
      </div>
    </motion.div>
  );
};

export default EmptyChatState;
