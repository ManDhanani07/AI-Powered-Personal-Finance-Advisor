import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, Target, HeartPulse, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const FinancialPerformanceSection = ({ budgetData, goalData, healthData, forecastData, monthlyReport }) => {
  const navigate = useNavigate();

  // 1. Budget Summary
  const bLimit = budgetData?.total_limit || 0;
  const bSpent = budgetData?.total_spent || 0;
  const bUtil = budgetData?.overall_utilization_pct || (bLimit > 0 ? (bSpent / bLimit) * 100 : 0);
  const budgetsList = budgetData?.budgets || [];
  const exceededCount = budgetsList.filter((b) => Number(b.spent || 0) > Number(b.limit || 0)).length;

  let bStatus = 'HEALTHY';
  let bStatusColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (exceededCount > 0) {
    bStatus = 'EXCEEDED';
    bStatusColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else if (bUtil >= 90) {
    bStatus = 'NEAR LIMIT';
    bStatusColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  } else if (bUtil >= 70) {
    bStatus = 'WARNING';
    bStatusColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  // 2. Goal Summary
  const goalsList = goalData?.goals || [];
  const completedGoals = goalsList.filter((g) => g.is_completed || g.status === 'ACHIEVED' || (g.target_amount > 0 && g.current_amount >= g.target_amount)).length;
  const activeGoals = Math.max(0, goalsList.length - completedGoals);
  const goalProgressPct = goalData?.overall_completion_pct || 0;

  // 3. Health Score Summary
  const currHealthScore = healthData?.latest_score || 75.0;
  const prevHealthScore = healthData?.previous_score || 72.0;
  const healthChange = healthData?.score_change ?? (currHealthScore - prevHealthScore);
  const healthStatus = healthData?.status || (currHealthScore >= 85 ? 'Excellent' : (currHealthScore >= 70 ? 'Good' : 'Fair'));
  const healthReason = healthData?.explanation || 'Improved due to strong savings rate and controlled spending.';

  // 4. Forecast Summary
  const forecastNextExp = forecastData?.forecast_next_month_expense || Math.round((bSpent || 50000) * 1.04);
  const expectedForecastChange = forecastData?.expected_expense_change_pct || 4.5;
  const forecastReliability = forecastData?.forecast_reliability || 'Moderate';

  // Performance Trend Chart Data
  const trendData = monthlyReport?.monthly_breakdown || [
    { month: 'Current', income: 80000, expense: 52000, savings: 28000 },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Module High-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Budget Performance */}
        <div className="p-5 rounded-3xl bg-bg-surface/80 border border-border-subtle backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Budget Performance
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${bStatusColor}`}>
                {bStatus}
              </span>
            </div>

            <div className="pt-1">
              <h4 className="text-2xl font-black text-white">{formatINR(bSpent)} / <span className="text-slate-400 text-lg">{formatINR(bLimit)}</span></h4>
              <p className="text-xs text-purple-300 font-mono mt-0.5">{bUtil.toFixed(1)}% Used</p>
            </div>

            {exceededCount > 0 && (
              <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{exceededCount} category exceeded its budget.</span>
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/budgets')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold transition-all border border-purple-500/30"
          >
            <span>View Budgets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Goal Progress */}
        <div className="p-5 rounded-3xl bg-bg-surface/80 border border-border-subtle backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                Goal Progress
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {goalProgressPct}% Overall
              </span>
            </div>

            <div className="pt-1">
              <h4 className="text-2xl font-black text-white">{activeGoals} Active Goals</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{completedGoals} Completed</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/goals')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/30"
          >
            <span>View Goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Financial Health */}
        <div className="p-5 rounded-3xl bg-bg-surface/80 border border-border-subtle backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Financial Health
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {healthStatus}
              </span>
            </div>

            <div className="pt-1">
              <h4 className="text-2xl font-black text-white">{currHealthScore} <span className="text-slate-400 text-sm font-normal">/ 100</span></h4>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {healthChange >= 0 ? `+${healthChange.toFixed(1)} points` : `${healthChange.toFixed(1)} points`}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2">{healthReason}</p>
          </div>

          <button
            onClick={() => navigate('/financial-health')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30"
          >
            <span>View Health Score</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Forecast Summary */}
        <div className="p-5 rounded-3xl bg-bg-surface/80 border border-border-subtle backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Forecast Outlook
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {forecastReliability}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Next Month Expense</span>
              <h4 className="text-2xl font-black text-white">{formatINR(forecastNextExp)}</h4>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">
                Expected Change: {expectedForecastChange >= 0 ? `+${expectedForecastChange}%` : `${expectedForecastChange}%`}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/forecast')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition-all border border-indigo-500/30"
          >
            <span>View Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Financial Performance Trend Chart */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Financial Performance Trajectory (Income, Expenses, Savings)
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val) => [formatINR(val)]}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
              <Line type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} />
              <Line type="monotone" dataKey="savings" name="Savings" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialPerformanceSection;
