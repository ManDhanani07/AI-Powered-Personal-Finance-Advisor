import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export const GoalTimeline = ({ recommendations = [] }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span>Smart Goal Insights & AI Recommendations</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, idx) => {
          const isSuccess = rec.severity === 'SUCCESS';
          const isWarning = rec.severity === 'WARNING';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl ${
                isSuccess
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : isWarning
                  ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-indigo-200 bg-indigo-50/70 text-indigo-900 dark:border-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : isWarning ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{rec.title}</span>
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] dark:bg-slate-900/60">
                    {rec.goal_name}
                  </span>
                </div>
                <p className="text-xs">{rec.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTimeline;
