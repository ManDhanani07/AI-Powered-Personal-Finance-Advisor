import React from 'react';
import { Target, CheckCircle2, Flag, ArrowRight, PlusCircle, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const GoalAnalytics = ({ data }) => {
  const navigate = useNavigate();

  if (!data || !data.goals || data.goals.length === 0) {
    return <EmptyState title="No Savings Goals Set" message="Set milestone goals to track your target savings progress over time." />;
  }

  const { total_target_amount, total_saved_amount, overall_completion_pct, goals } = data;

  const completedCount = goals.filter(
    (g) => g.is_completed || g.status === 'ACHIEVED' || (g.target_amount > 0 && g.current_amount >= g.target_amount)
  ).length;
  const activeCount = Math.max(0, goals.length - completedCount);
  const behindCount = goals.filter(
    (g) => !g.is_completed && g.status !== 'ACHIEVED' && (g.target_amount > 0 ? (g.current_amount / g.target_amount) < 0.4 : false)
  ).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Target Amount</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatINR(total_target_amount)}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Saved Balance</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatINR(total_saved_amount)}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Overall Completion</span>
          <h3 className="text-2xl font-black text-white mt-1">{overall_completion_pct}%</h3>
        </div>
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active / Completed</span>
          <h3 className="text-2xl font-black text-white mt-1">{activeCount} / {completedCount}</h3>
        </div>
      </div>

      {/* Goal Milestones & Progress */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Savings Goals Progress & Milestones
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/goals')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/30"
            >
              <Target className="w-3.5 h-3.5" />
              <span>View Goal</span>
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Contribution</span>
            </button>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold transition-all border border-purple-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g, idx) => {
            const name = g.name || g.goal_name || `Goal #${idx + 1}`;
            const target = Number(g.target_amount || 0);
            const saved = Number(g.current_amount || 0);
            const remaining = Math.max(0, target - saved);
            const pct = Number(g.completion_pct || g.completion_percentage || (target > 0 ? (saved / target) * 100 : 0)).toFixed(1);
            const isDone = g.is_completed || pct >= 100;
            const isBehind = !isDone && pct < 40;

            return (
              <div key={g.goal_id || idx} className="p-5 rounded-2xl bg-bg-card/50 border border-border-subtle space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    <span>{name}</span>
                  </span>
                  <span className={`text-xs font-black font-mono ${isDone ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {pct}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isBehind
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Saved: <strong className="text-white">{formatINR(saved)}</strong></span>
                  <span>Target: <strong className="text-slate-300">{formatINR(target)}</strong></span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Remaining: {formatINR(remaining)}</span>
                  </span>
                  <span className={`font-black px-2 py-0.5 rounded-full text-[10px] border ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : isBehind
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {isDone ? 'COMPLETED' : (isBehind ? 'BEHIND SCHEDULE' : 'ON TRACK')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalAnalytics;
