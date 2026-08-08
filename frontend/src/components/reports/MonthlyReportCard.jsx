import React from 'react';
import { Calendar, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const MonthlyReportCard = ({ monthlyData }) => {
  if (!monthlyData) return null;

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Year {monthlyData.year} Monthly Executive Summary
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-bg-card/50 border border-border-subtle">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Year Income</span>
          <p className="text-lg font-black text-emerald-400 mt-0.5">{formatINR(monthlyData.total_income)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-bg-card/50 border border-border-subtle">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Year Expenses</span>
          <p className="text-lg font-black text-rose-400 mt-0.5">{formatINR(monthlyData.total_expenses)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-bg-card/50 border border-border-subtle">
          <span className="text-[10px] font-bold uppercase text-slate-400">Avg Monthly Expense</span>
          <p className="text-lg font-black text-indigo-400 mt-0.5">{formatINR(monthlyData.avg_monthly_expense)}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportCard;
