import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  FileCode,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Loader2,
  Filter,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminDataManagement = () => {
  const [activeTab, setActiveTab] = useState('datasets');
  const [datasets, setDatasets] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dRes, jRes] = await Promise.all([
        adminService.getDatasets(),
        adminService.getImportJobs(),
      ]);
      setDatasets(dRes?.datasets || []);
      setJobs(jRes?.jobs || []);
    } catch (err) {
      console.error('Failed to load data management registries:', err);
      showToast.error('Failed to load dataset telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Loading data quality scores and batch ingestion telemetry…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-outfit">Data Pipeline & Dataset Governance</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Machine learning corpus health, data quality scores, and bank statement batch import logs.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        {[
          { id: 'datasets', label: 'ML Training Datasets', icon: Layers },
          { id: 'jobs', label: 'Batch Import Jobs', icon: Upload },
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

      {/* ── Tab 1: Dataset Registry ── */}
      {activeTab === 'datasets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {datasets.map((ds) => (
            <div key={ds.id} className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white font-outfit">{ds.name}</h3>
                    </div>
                    <span className="font-mono text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 mt-1 inline-block">
                      {ds.version}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Score: {ds.data_quality_score}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Row Count</span>
                    <p className="text-sm font-black text-white font-mono mt-0.5">{ds.row_count}</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Columns</span>
                    <p className="text-sm font-black text-white font-mono mt-0.5">{ds.column_count}</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Missing Data</span>
                    <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">{ds.missing_values_pct}</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Duplicates</span>
                    <p className="text-sm font-black text-slate-300 font-mono mt-0.5">{ds.duplicate_count}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <p>Date Coverage: <span className="text-slate-200">{ds.date_range}</span></p>
                  <p>Target Status: <span className="text-teal-400">{ds.status}</span></p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 text-[10px] text-slate-500 font-mono">
                Last updated: {ds.updated_at}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 2: Batch Import Jobs ── */}
      {activeTab === 'jobs' && (
        <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-white font-outfit">Batch Statement & Ledger Ingestion Queue</h3>
            <span className="text-xs text-slate-400 font-mono">Asynchronous Parser Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Import ID</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">File / Format</th>
                  <th className="py-3.5 px-4 text-center">Processed</th>
                  <th className="py-3.5 px-4 text-center">Success</th>
                  <th className="py-3.5 px-4 text-center">Failed</th>
                  <th className="py-3.5 px-4 text-center">Duplicates</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-sans">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">{job.id}</td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{job.user}</td>
                    <td className="py-3 px-4 text-slate-300">{job.file_type}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">{job.records_processed}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{job.successful_records}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-400">{job.failed_records}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">{job.duplicates}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{job.timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          job.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataManagement;
