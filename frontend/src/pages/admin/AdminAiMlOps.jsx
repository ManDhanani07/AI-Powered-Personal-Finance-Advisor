import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Sparkles,
  Bot,
  Activity,
  Layers,
  History,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  GitBranch,
  Gauge,
  Clock,
  Database,
  Sliders,
  Filter,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminAiMlOps = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [modelsData, setModelsData] = useState(null);
  const [versionsData, setVersionsData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackFilter, setFeedbackFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, vRes, fRes] = await Promise.all([
        adminService.getAiModels(),
        adminService.getModelVersions(),
        adminService.getAiFeedback(),
      ]);
      setModelsData(mRes);
      setVersionsData(vRes);
      setFeedbackData(fRes);
    } catch (err) {
      console.error('Failed to load AI/ML Ops telemetry:', err);
      showToast.error('Failed to load AI model metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRollback = async (version, modelName) => {
    try {
      await adminService.rollbackModel({ version, model_name: modelName });
      showToast.success(`Rollback to ${version} initiated successfully.`);
      loadData();
    } catch {
      showToast.error('Failed to initiate model rollback.');
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Loading AI/ML telemetry and drift monitors…</p>
      </div>
    );
  }

  const models = modelsData?.models || [];
  const versions = versionsData?.versions || [];
  const sat = feedbackData?.satisfaction || { helpful_pct: 84.6, neutral_pct: 10.2, not_helpful_pct: 5.2, total_reviews: 1280 };
  const rawFeedback = feedbackData?.feedback_items || [];
  const feedbackItems = feedbackFilter === 'ALL'
    ? rawFeedback
    : rawFeedback.filter((item) => item.rating.toUpperCase() === feedbackFilter);

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Operations Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-black text-white font-outfit">AI & Machine Learning Operations Center</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● 3 Models Healthy
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-model telemetry, real-time drift detection, version governance and user feedback analysis
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh AI Telemetry</span>
        </button>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        {[
          { id: 'models', label: 'Production Models & Drift', icon: Layers },
          { id: 'versions', label: 'Version Registry & Rollback', icon: GitBranch },
          { id: 'feedback', label: 'AI Feedback & Satisfaction', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Production Models & Drift Monitoring ── */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Model Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white font-outfit">{m.name}</h3>
                        <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {m.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{m.type}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {m.status}
                    </span>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                    {m.accuracy && (
                      <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</span>
                        <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">{m.accuracy}</p>
                      </div>
                    )}
                    {m.f1_score && (
                      <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">F1 Score</span>
                        <p className="text-sm font-black text-indigo-400 font-mono mt-0.5">{m.f1_score}</p>
                      </div>
                    )}
                    {m.mae && (
                      <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">MAE Error</span>
                        <p className="text-sm font-black text-teal-400 font-mono mt-0.5">{m.mae}</p>
                      </div>
                    )}
                    {m.rmse && (
                      <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">RMSE Error</span>
                        <p className="text-sm font-black text-sky-400 font-mono mt-0.5">{m.rmse}</p>
                      </div>
                    )}
                    {m.precision && (
                      <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Precision</span>
                        <p className="text-sm font-black text-violet-400 font-mono mt-0.5">{m.precision}</p>
                      </div>
                    )}
                    {m.recall && (
                      <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Recall</span>
                        <p className="text-sm font-black text-amber-400 font-mono mt-0.5">{m.recall}</p>
                      </div>
                    )}
                    <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Latency</span>
                      <p className="text-sm font-black text-slate-200 font-mono mt-0.5">{m.latency}</p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence</span>
                      <p className="text-sm font-black text-slate-200 font-mono mt-0.5">{m.avg_confidence || '92.4%'}</p>
                    </div>
                  </div>

                  {/* Drift & Dataset Section */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data Drift:</span>
                      <span className="text-emerald-400 font-bold">{m.data_drift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model Drift:</span>
                      <span className="text-emerald-400 font-bold">{m.model_drift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dataset:</span>
                      <span className="text-slate-300 truncate max-w-[150px]">{m.dataset_version}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Trained: {m.last_trained}</span>
                  <span className="font-mono text-indigo-400 font-bold">{m.prediction_count?.toLocaleString()} calls</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 2: Version Registry & Rollback UI ── */}
      {activeTab === 'versions' && (
        <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white font-outfit">Model Deployment & Version Registry</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit deployment history, benchmark performance diffs, and initiate one-click production rollbacks.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
              4 Releases Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Model Pipeline</th>
                  <th className="py-3.5 px-4">Primary Metric</th>
                  <th className="py-3.5 px-4">Dataset</th>
                  <th className="py-3.5 px-4">Deployed Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Rollback Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {versions.map((v, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{v.version}</td>
                    <td className="py-3 px-4 font-bold text-white">{v.model_name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{v.accuracy || v.mae}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{v.dataset}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{v.deployed_at}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          v.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-slate-400 border-zinc-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!v.is_active && (
                        <button
                          onClick={() => handleRollback(v.version, v.model_name)}
                          className="px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-indigo-400" />
                          <span>Rollback</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: AI Feedback & Recommendation Satisfaction ── */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Satisfaction Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total User Reviews</span>
              <p className="text-2xl font-black text-white font-outfit">{sat.total_reviews?.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Helpful Rating</span>
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-outfit">{sat.helpful_pct}%</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Neutral</span>
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-300 font-outfit">{sat.neutral_pct}%</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Not Helpful</span>
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 font-outfit">{sat.not_helpful_pct}%</p>
            </div>
          </div>

          {/* Feedback Inspection Table */}
          <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white font-outfit">AI Advice & Copilot Feedback Logs</h3>
                <p className="text-xs text-slate-400 mt-0.5">Inspect user ratings on generated financial advice and recommendations.</p>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-semibold text-slate-500">Filter:</span>
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                >
                  <option value="ALL">All Ratings</option>
                  <option value="HELPFUL">Helpful Only</option>
                  <option value="NEUTRAL">Neutral Only</option>
                  <option value="NOT HELPFUL">Not Helpful Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Feature / Query Prompt</th>
                    <th className="py-3.5 px-4">AI Output Summary</th>
                    <th className="py-3.5 px-4">Model</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">User Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {feedbackItems.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{f.user}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-300">"{f.question}"</td>
                      <td className="py-3 px-4 max-w-sm truncate text-slate-400">{f.ai_response_summary}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-400">{f.model_version}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{f.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            f.rating === 'Helpful'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : f.rating === 'Neutral'
                              ? 'bg-zinc-800 text-slate-400 border-zinc-700'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {f.rating === 'Helpful' ? <ThumbsUp className="w-2.5 h-2.5" /> : null}
                          {f.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiMlOps;
