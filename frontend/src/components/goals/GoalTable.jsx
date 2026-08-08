import React from 'react';
import * as Icons from 'lucide-react';
import { Edit3, Trash2, Pause, Play } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import GoalProgress from './GoalProgress.jsx';

export const GoalTable = ({ goals = [], onEdit, onToggleStatus, onDelete }) => {
  if (!goals.length) return null;

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-md dark:bg-slate-800/90 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th scope="col" className="py-3.5 px-4">Goal Name</th>
            <th scope="col" className="py-3.5 px-4">Priority</th>
            <th scope="col" className="py-3.5 px-4 text-right">Target</th>
            <th scope="col" className="py-3.5 px-4 text-right">Saved</th>
            <th scope="col" className="py-3.5 px-4 text-right">Req. Monthly</th>
            <th scope="col" className="py-3.5 px-4 w-48">Progress</th>
            <th scope="col" className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {goals.map((g) => {
            const IconComp = (g.icon && Icons[g.icon]) || Icons.Target;
            const isPaused = g.status === 'PAUSED';

            return (
              <tr key={g.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: g.color ? `${g.color}15` : '#6366F115',
                        color: g.color || '#6366F1',
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{g.goal_name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{g.goal_type || 'Savings'}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      g.priority === 'CRITICAL'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : g.priority === 'HIGH'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {g.priority}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {formatCurrency(g.target_amount)}
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(g.current_amount)}
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-slate-600 dark:text-slate-300">
                  {formatCurrency(g.required_monthly_saving)}/mo
                </td>

                <td className="py-3.5 px-4 w-48">
                  <GoalProgress
                    percentage={g.completion_percentage}
                    performanceStatus={g.performance_status}
                  />
                </td>

                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(g)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title={isPaused ? 'Resume' : 'Pause'}
                    >
                      {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-500" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(g)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(g)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GoalTable;
