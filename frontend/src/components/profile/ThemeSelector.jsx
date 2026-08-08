import React from 'react';
import { Moon, CheckCircle2 } from 'lucide-react';

export const ThemeSelector = () => {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-white font-outfit">Dark Mode Enforced</p>
          <p className="text-[11px] text-slate-400">High-contrast dark theme optimized for wealth analytics & data clarity.</p>
        </div>
      </div>
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Active</span>
      </div>
    </div>
  );
};

export default ThemeSelector;
