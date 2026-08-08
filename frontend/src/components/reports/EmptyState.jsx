import React from 'react';
import { Database, PlusCircle, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  title = 'No Report Data Found',
  message = 'There are no PostgreSQL transactions or financial records logged for the selected period filter.',
  actionText,
  actionLink,
  onAction,
}) => {
  // Determine smart defaults if not explicitly provided
  let defaultText = 'Add Transactions';
  let defaultLink = '/transactions';

  if (title.toLowerCase().includes('goal')) {
    defaultText = 'Create Goal';
    defaultLink = '/goals';
  } else if (title.toLowerCase().includes('budget')) {
    defaultText = 'Create Budget';
    defaultLink = '/budgets';
  }

  const btnText = actionText || defaultText;
  const btnLink = actionLink || defaultLink;

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-12 rounded-3xl text-center space-y-4 shadow-xl">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
        <Database className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      <div className="pt-2 flex justify-center">
        {onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{btnText}</span>
          </button>
        ) : (
          <Link
            to={btnLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{btnText}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
