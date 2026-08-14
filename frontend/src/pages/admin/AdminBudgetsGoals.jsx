import React, { useState, useEffect } from 'react';
import { Target, PieChart, TrendingUp, PiggyBank, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService.js';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

export const AdminBudgetsGoals = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await adminService.getBudgetsGoals();
        setData(res);
      } catch (err) {
        console.error('Failed to load budgets & goals stats:', err);
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
        <p className="text-xs text-slate-500 font-mono">Loading budgets & goals…</p>
      </div>
    );
  }

  const d = data || {};

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Budgets" value={d.active_budgets?.toLocaleString()} icon={PieChart} color="text-teal-400" />
        <StatCard label="Total Allocation" value={formatCompactFinancial(d.total_budget_allocation)} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Active Savings Goals" value={d.active_goals?.toLocaleString()} icon={Target} color="text-amber-400" />
        <StatCard label="Total Goal Savings" value={formatCompactFinancial(d.total_goal_savings)} icon={PiggyBank} color="text-indigo-400" />
      </div>

      {/* Progress & Utilization Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Utilization */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase">Platform Budget Utilization</span>
            <span className="font-mono font-bold text-teal-400">{d.budget_utilization_pct}%</span>
          </div>
          <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${d.budget_utilization_pct}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">Average spending relative to active category budget allocations.</p>
        </div>

        {/* Goal Completion */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase">Goal Completion Rate</span>
            <span className="font-mono font-bold text-amber-400">{d.goal_completion_pct}%</span>
          </div>
          <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${d.goal_completion_pct}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">Aggregate vault progress towards target savings amounts.</p>
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
    <p className={`text-xl font-black font-outfit ${color}`}>{value || 0}</p>
  </div>
);

export default AdminBudgetsGoals;
