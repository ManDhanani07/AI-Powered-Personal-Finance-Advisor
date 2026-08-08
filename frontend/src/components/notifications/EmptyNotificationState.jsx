import React from 'react';
import { BellOff, Sparkles } from 'lucide-react';

export const EmptyNotificationState = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-bg-surface/60 backdrop-blur-xl border border-border-subtle rounded-3xl shadow-xl space-y-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-border-subtle flex items-center justify-center text-slate-400 shadow-inner">
          <BellOff className="w-10 h-10 stroke-[1.5]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-xl font-bold text-white tracking-tight">No new notifications.</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          You are all caught up! PostgreSQL engine is monitoring your accounts and transactions.
        </p>
      </div>
    </div>
  );
};

export default EmptyNotificationState;
