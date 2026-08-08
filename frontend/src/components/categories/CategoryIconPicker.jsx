import React from 'react';
import * as Icons from 'lucide-react';

const AVAILABLE_ICONS = [
  'Utensils',
  'ShoppingBag',
  'Car',
  'HeartPulse',
  'Zap',
  'Film',
  'Briefcase',
  'TrendingUp',
  'PiggyBank',
  'Landmark',
  'Gift',
  'GraduationCap',
  'Plane',
  'Home',
  'Smartphone',
  'ShieldAlert',
  'Tag',
  'Receipt',
  'DollarSign',
  'Laptop',
];

export const CategoryIconPicker = ({ selectedIcon, onSelectIcon }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Choose Icon
      </label>
      <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
        {AVAILABLE_ICONS.map((iconName) => {
          const IconComp = Icons[iconName] || Icons.Tag;
          const isSelected = selectedIcon === iconName;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelectIcon(iconName)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 dark:bg-indigo-500'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              title={iconName}
            >
              <IconComp className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryIconPicker;
