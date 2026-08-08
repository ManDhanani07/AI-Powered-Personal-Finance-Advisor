import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorScreen = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this page.',
  onRetry,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="max-w-md w-full fintech-card flex flex-col items-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        {onRetry && (
          <button onClick={onRetry} type="button" className="btn-primary mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </button>
        )}
      </div>
    </div>
  );
};
