import React, { useState, useMemo } from 'react';
import { Sliders, Sparkles, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const ScenarioPlanner = ({ currentMonthlySavings = 0, currentMonthlyExpenses = 0 }) => {
  const [extraSavings, setExtraSavings] = useState(5000);
  const [expenseCutPct, setExpenseCutPct] = useState(10);

  // Compute scenario projection
  const scenarioData = useMemo(() => {
    const expenseReduction = (currentMonthlyExpenses * (expenseCutPct / 100));
    const effectiveMonthlySavings = max(1000, currentMonthlySavings + extraSavings + expenseReduction);

    const points = [];
    const now = new Date();
    let cumulativeBaseline = 0;
    let cumulativeOptimized = 0;

    const baseMonthly = max(500, currentMonthlySavings);

    for (let month = 1; month <= 12; month++) {
      const d = new Date(now.getFullYear(), now.getMonth() + month, 1);
      const mLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      // Assuming 7% annual compounding return on savings
      const monthlyRate = 0.07 / 12;
      cumulativeBaseline = (cumulativeBaseline + baseMonthly) * (1 + monthlyRate);
      cumulativeOptimized = (cumulativeOptimized + effectiveMonthlySavings) * (1 + monthlyRate);

      points.push({
        month: mLabel,
        baseline: Math.round(cumulativeBaseline),
        optimized: Math.round(cumulativeOptimized),
        delta: Math.round(cumulativeOptimized - cumulativeBaseline),
      });
    }

    const yr1Baseline = points[11]?.baseline || 0;
    const yr1Optimized = points[11]?.optimized || 0;

    return {
      points,
      yr1Baseline,
      yr1Optimized,
      yr1Gain: yr1Optimized - yr1Baseline,
      effectiveMonthlySavings,
    };
  }, [currentMonthlySavings, currentMonthlyExpenses, extraSavings, expenseCutPct]);

  function max(a, b) { return a > b ? a : b; }

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Interactive Wealth Scenario Planner</h3>
            <p className="text-xs text-slate-400">Simulate capital accumulation trajectory with custom savings goals</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-bg-card/60 px-4 py-2 rounded-2xl border border-border-subtle text-xs">
          <span className="text-slate-400">Projected 1-Year Capital Gain:</span>
          <span className="font-extrabold text-emerald-400">+{formatINR(scenarioData.yr1Gain)}</span>
        </div>
      </div>

      {/* Sliders Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-card/40 p-5 rounded-2xl border border-border-subtle">
        {/* Slider 1: Extra Monthly Savings */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-300">Additional Monthly Savings Contribution</label>
            <span className="font-black text-primary-400">{formatINR(extraSavings)}/mo</span>
          </div>
          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={extraSavings}
            onChange={(e) => setExtraSavings(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>+₹0</span>
            <span>+₹25,000</span>
            <span>+₹50,000</span>
          </div>
        </div>

        {/* Slider 2: Discretionary Spend Cut */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-300">Discretionary Expense Optimization</label>
            <span className="font-black text-rose-400">-{expenseCutPct}% Spend</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={expenseCutPct}
            onChange={(e) => setExpenseCutPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (As-Is)</span>
            <span>-20% Reduction</span>
            <span>-40% Strict Cut</span>
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={scenarioData.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                formatINR(value),
                name === 'optimized' ? 'Optimized Scenario' : 'Current Pace',
              ]}
            />
            <Area type="monotone" dataKey="baseline" stroke="#6366F1" strokeWidth={2} fill="url(#gradBaseline)" />
            <Area type="monotone" dataKey="optimized" stroke="#10B981" strokeWidth={3} fill="url(#gradOptimized)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-4 text-slate-400 font-mono">
        <span>Baseline 12M Projection: <strong className="text-white">{formatINR(scenarioData.yr1Baseline)}</strong></span>
        <span>Optimized 12M Projection: <strong className="text-emerald-400">{formatINR(scenarioData.yr1Optimized)}</strong></span>
      </div>
    </div>
  );
};

export default ScenarioPlanner;
