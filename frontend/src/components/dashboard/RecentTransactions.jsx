import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

const LIMITS = [10, 20, 50];

const DirectionIcon = ({ direction }) => {
  if (direction === 'IN') return <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />;
  if (direction === 'OUT') return <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />;
  return <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />;
};

const TypeBadge = ({ type }) => {
  const styles = {
    INCOME: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20',
    EXPENSE: 'bg-rose-950/60 text-rose-400 border border-rose-500/20',
    TRANSFER: 'bg-slate-800 text-slate-400 border border-slate-700',
  }[type] || 'bg-slate-800 text-slate-400';
  return <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${styles}`}>{type}</span>;
};

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3 py-3 border-b border-slate-800">
    <div className="h-9 w-9 bg-slate-700 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-slate-700 rounded w-1/2" />
      <div className="h-2.5 bg-slate-800 rounded w-1/3" />
    </div>
    <div className="h-4 bg-slate-700 rounded w-16" />
  </div>
);

export const RecentTransactions = ({ recentTransactions, loading, onLimitChange, limit }) => {
  if (loading) {
    return (
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  const txs = recentTransactions?.transactions || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">Recent Transactions</h3>
          <p className="text-xs text-slate-400">Latest {txs.length} transactions</p>
        </div>
        {txs.length > 0 && (
          <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
            {LIMITS.map((l) => (
              <button
                key={l}
                onClick={() => onLimitChange(l)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  limit === l
                    ? 'bg-slate-700 text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {txs.length === 0 ? (
        <EmptyLedgerCallout title="No Recent Transactions" />
      ) : (
        <div className="space-y-0 divide-y divide-slate-800">
          {txs.map((tx) => {
            const isIncome = tx.direction === 'IN';
            const isExpense = tx.direction === 'OUT';
            const catColor = tx.category?.color || '#6366F1';

            return (
              <div key={tx.id} className="flex items-center gap-3 py-3 group">
                <div
                  className="flex-shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${catColor}20`, border: `1px solid ${catColor}40` }}
                >
                  <DirectionIcon direction={tx.direction} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-100 truncate">
                    {tx.merchant || tx.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {tx.category && (
                      <span
                        className="text-[10px] font-medium rounded-full px-2 py-0.5"
                        style={{
                          color: catColor,
                          backgroundColor: `${catColor}18`,
                        }}
                      >
                        {tx.category.category_name}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {formatDate(tx.transaction_date, { day: '2-digit', month: 'short' })}
                    </span>
                    {tx.payment_method && (
                      <span className="text-[10px] text-slate-400">{tx.payment_method}</span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-black ${
                    isIncome
                      ? 'text-emerald-400'
                      : isExpense
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}>
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatCurrency(Math.abs(Number(tx.amount)))}
                  </p>
                  <TypeBadge type={tx.transaction_type} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
