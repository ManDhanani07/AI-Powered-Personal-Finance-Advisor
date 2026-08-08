import React from 'react';
import * as Icons from 'lucide-react';
import { Edit3, Copy, Trash2, Shield } from 'lucide-react';

export const CategoryCard = ({ category, onEdit, onDuplicate, onDelete }) => {
  const IconComp = Icons[category.icon] || Icons.Tag;
  const isDefault = category.is_default;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800/60"
          >
            <IconComp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {category.category_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  category.category_type === 'INCOME'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : category.category_type === 'INVESTMENT'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {category.category_type}
              </span>
              {isDefault && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Shield className="h-2.5 w-2.5" />
                  System Default
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {category.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
          {category.description}
        </p>
      )}

      {!isDefault && (
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Edit Category"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(category.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
