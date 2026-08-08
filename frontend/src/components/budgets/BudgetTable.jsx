import React from 'react';
import * as Icons from 'lucide-react';
import { Edit3, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import BudgetProgress from './BudgetProgress.jsx';

export const BudgetTable = ({ budgets = [], onEdit, onDelete }) => {
  if (!budgets.length) return null;

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-md dark:bg-slate-800/90 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th scope="col" className="py-3.5 px-4">Budget Name</th>
            <th scope="col" className="py-3.5 px-4">Category</th>
            <th scope="col" className="py-3.5 px-4 text-right">Allocated</th>
            <th scope="col" className="py-3.5 px-4 text-right">Spent</th>
            <th scope="col" className="py-3.5 px-4 text-right">Remaining</th>
            <th scope="col" className="py-3.5 px-4 w-48">Progress</th>
            <th scope="col" className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {budgets.map((b) => {
            const category = b.category;
            const IconComp = (category?.icon && Icons[category.icon]) || Icons.PiggyBank;

            return (
              <tr key={b.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: category?.color ? `${category.color}15` : '#6366F115',
                        color: category?.color || '#6366F1',
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {b.budget_name}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {category?.category_name || 'General Overall'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(b.budget_amount)}
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {formatCurrency(b.spent_amount)}
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-slate-600 dark:text-slate-300">
                  {formatCurrency(b.remaining_amount)}
                </td>

                <td className="py-3.5 px-4 w-48">
                  <BudgetProgress
                    percentage={b.utilization_percentage}
                    healthStatus={b.health_status}
                  />
                </td>

                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(b)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(b)}
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

export default BudgetTable;
