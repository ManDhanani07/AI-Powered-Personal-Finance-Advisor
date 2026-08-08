import { Loader2 } from 'lucide-react';

export const LoadingScreen = ({ message = 'Loading application...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-slate-900 border border-brand-200 dark:border-slate-800 flex items-center justify-center shadow-soft">
          <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
};
