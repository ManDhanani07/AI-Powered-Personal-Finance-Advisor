import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { HeartPulse, Award, ShieldCheck, Activity, Info, TrendingUp, TrendingDown } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

export const HealthAnalytics = ({ data }) => {
  if (!data || (!data.score_trend && !data.history)) {
    return <EmptyState title="No Financial Health History" message="Calculate your financial health score to view historical trend reports." />;
  }

  const score_trend = data.score_trend || data.history || [];
  const latest_score = data.latest_score || (score_trend.length ? score_trend[score_trend.length - 1].score : 75.0);
  const previous_score = data.previous_score || (score_trend.length > 1 ? score_trend[score_trend.length - 2].score : latest_score);
  const score_change = data.score_change ?? (latest_score - previous_score);
  const latest_grade = data.latest_grade || (latest_score >= 85 ? 'A' : (latest_score >= 70 ? 'B' : (latest_score >= 55 ? 'C' : 'D')));
  const status = data.status || (latest_score >= 85 ? 'EXCELLENT' : (latest_score >= 70 ? 'GOOD' : (latest_score >= 55 ? 'FAIR' : 'VULNERABLE')));

  // 5 Factors
  const factors = data.factors || [
    { factor: 'Savings Rate', score: 80, explanation: 'Strong monthly surplus contribution to wealth accumulation.' },
    { factor: 'Budget Management', score: 85, explanation: 'Spending is well-aligned within category budget envelopes.' },
    { factor: 'Spending Control', score: 75, explanation: 'Discretionary spending is monitored and constrained.' },
    { factor: 'Goal Progress', score: 70, explanation: 'Milestone vaults are steadily accumulating reserves.' },
    { factor: 'Income Stability', score: 85, explanation: 'Consistent monthly income inflow registered.' },
  ];

  const radarData = factors.map((f) => ({
    subject: f.factor,
    A: f.score,
    fullMark: 100,
  }));

  const isScoreUp = score_change >= 0;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Current Health Score</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
              isScoreUp ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {isScoreUp ? '↑' : '↓'} {Math.abs(score_change)} pts vs prev
            </span>
          </div>
          <h3 className="text-4xl font-black text-white mt-2">{latest_score} <span className="text-lg text-slate-400 font-normal">/ 100</span></h3>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 text-indigo-400">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Financial Grade</span>
          </div>
          <h3 className="text-4xl font-black text-white mt-2">Grade {latest_grade}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-500/30 text-cyan-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Health Status</span>
          </div>
          <h3 className="text-3xl font-black text-white mt-2">{status}</h3>
        </div>
      </div>

      {/* Narrative Explanation Banner */}
      <div className="p-5 rounded-3xl bg-bg-surface/80 border border-border-subtle backdrop-blur-xl flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {data.explanation || `Your financial health score of ${latest_score} (${latest_grade}) is driven by your savings rate, budget discipline, and goal progress. Maintain spending controls to improve your score.`}
        </p>
      </div>

      {/* 5 Factors Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Health Score Factor Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factors.map((f, i) => (
            <div key={i} className="p-4 rounded-2xl bg-bg-card/50 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{f.factor}</span>
                <span className="font-black text-xs text-emerald-400 font-mono">{f.score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, f.score)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-normal">{f.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Financial Health Score Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={score_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                <Line type="monotone" dataKey="score" name="Health Score" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Health Factor Radar Analysis
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={10} />
                <Radar name="Score" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAnalytics;
