import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, DollarSign, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService.js';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

export const AdminFinancialActivity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await adminService.getFinancialActivity();
        setData(res);
      } catch (err) {
        console.error('Failed to load financial activity:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        <p className="text-xs text-slate-500 font-mono">Loading financial analytics…</p>
      </div>
    );
  }

  const d = data || {};

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Platform Income" value={formatCompactFinancial(d.total_income)} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Total Platform Expenses" value={formatCompactFinancial(d.total_expense)} icon={TrendingDown} color="text-rose-400" />
        <StatCard label="Platform Total Savings" value={formatCompactFinancial(d.total_savings)} icon={PiggyBank} color="text-indigo-400" />
        <StatCard label="Avg Transaction Value" value={formatCurrency(d.average_transaction_value)} icon={DollarSign} color="text-sky-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B]">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Most Popular Category</span>
          <p className="text-lg font-black text-white font-outfit mt-1">{d.most_popular_category}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Highest Spending Category</span>
          <p className="text-lg font-black text-rose-400 font-outfit mt-1">{d.highest_spending_category}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase">Average Savings Rate</span>
          <p className="text-lg font-black text-emerald-400 font-outfit mt-1">{d.avg_savings_rate}%</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="p-4 rounded-xl border border-zinc-800 bg-[#09090B] space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-xl font-black font-outfit ${color}`}>{value}</p>
  </div>
);

export default AdminFinancialActivity;
