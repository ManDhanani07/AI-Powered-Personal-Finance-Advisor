import React from 'react';
import * as Icons from 'lucide-react';
import { Edit3, Copy, Trash2, Shield } from 'lucide-react';

export const CategoryTable = ({ categories = [], onEdit, onDuplicate, onDelete }) => {
  if (!categories.length) return null;

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-md dark:bg-slate-800/90 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th scope="col" className="py-3.5 px-4">Category Name</th>
            <th scope="col" className="py-3.5 px-4">Type</th>
            <th scope="col" className="py-3.5 px-4">Source</th>
            <th scope="col" className="py-3.5 px-4">Description</th>
            <th scope="col" className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {categories.map((cat) => {
            const IconComp = Icons[cat.icon] || Icons.Tag;
            const isDefault = cat.is_default;

            return (
              <tr key={cat.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {cat.category_name}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      cat.category_type === 'INCOME'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : cat.category_type === 'INVESTMENT'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {cat.category_type}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  {isDefault ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <Shield className="h-3 w-3" />
                      System Default
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      User Custom
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                  {cat.description || 'N/A'}
                </td>

                <td className="py-3.5 px-4 text-center">
                  {!isDefault ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(cat)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(cat.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(cat)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium italic">System</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
