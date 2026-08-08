import React from 'react';
import { AlertOctagon, AlertTriangle, Info, Flame } from 'lucide-react';

export const BudgetAlertCard = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Active Budget Alerts
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert, idx) => {
          const isExceeded = alert.alert_level === 'EXCEEDED';
          const isCritical = alert.alert_level === 'CRITICAL';
          const isWarning = alert.alert_level === 'WARNING';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl ${
                isExceeded
                  ? 'border-red-200 bg-red-50/70 text-red-900 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300'
                  : isCritical
                  ? 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-300'
                  : isWarning
                  ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isExceeded ? (
                  <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : isCritical ? (
                  <Flame className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                ) : isWarning ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{alert.budget_name}</span>
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] dark:bg-slate-900/60">
                    {alert.utilization_pct}% Used
                  </span>
                </div>
                <p className="text-xs">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetAlertCard;
