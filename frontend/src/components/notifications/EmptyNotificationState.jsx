import React from 'react';
import { BellOff } from 'lucide-react';

export const EmptyNotificationState = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center p-8 border border-zinc-800 rounded-2xl bg-[#09090B] space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-500">
        <BellOff className="w-7 h-7" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-bold text-white tracking-tight">All caught up</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          No new alerts or notifications at this time.
        </p>
      </div>
    </div>
  );
};

export default EmptyNotificationState;
