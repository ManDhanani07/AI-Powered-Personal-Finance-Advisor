import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, Target, BarChart2, Bot, Landmark,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

const ACTIONS = [
  {
    label: 'Add Transaction',
    icon: PlusCircle,
    to: ROUTES.TRANSACTIONS,
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-500/30',
    description: 'Log income or expense',
  },
  {
    label: 'Create Budget',
    icon: Landmark,
    to: ROUTES.BUDGETS,
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/30',
    description: 'Set spending limits',
  },
  {
    label: 'Create Goal',
    icon: Target,
    to: ROUTES.GOALS,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    description: 'Plan your savings',
  },
  {
    label: 'View Reports',
    icon: BarChart2,
    to: ROUTES.REPORTS,
    gradient: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-500/30',
    description: 'Detailed analytics',
  },
  {
    label: 'AI Advisor',
    icon: Bot,
    to: ROUTES.AI_ADVISOR,
    gradient: 'from-fuchsia-500 to-pink-600',
    shadow: 'shadow-fuchsia-500/30',
    description: 'Get AI insights',
    isPlaceholder: true,
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Actions</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Jump to key features</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className={`group relative rounded-2xl bg-gradient-to-br ${action.gradient} p-4 text-white shadow-lg ${action.shadow} hover:scale-105 hover:shadow-xl transition-all duration-300 text-left overflow-hidden`}
            >
              {/* Glow blob */}
              <div className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

              {action.isPlaceholder && (
                <span className="absolute top-2 right-2 text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-bold">
                  Soon
                </span>
              )}

              <Icon className="h-6 w-6 mb-2 opacity-90" />
              <p className="text-xs font-bold leading-tight">{action.label}</p>
              <p className="text-[10px] text-white/70 mt-0.5">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
