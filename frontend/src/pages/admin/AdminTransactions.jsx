import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowRight,
  RotateCcw,
  Activity,
  ShieldAlert,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  Database,
  Check,
  Zap,
  Info,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import AdminTransactionDetailModal from './AdminTransactionDetailModal.jsx';

// Custom dark Recharts tooltip
const ChartTooltip = ({ active, payload, label, isRate = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md z-50">
        <p className="font-semibold text-white font-mono border-b border-zinc-800/80 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {isRate ? `${entry.value}%` : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminTransactions = () => {
  // Global Controls - Default to 30 Days as requested
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Core Data States
  const [summary, setSummary] = useState(null);
  const [quality, setQuality] = useState(null);
  const [trends, setTrends] = useState({ processing_trend: [], quality_trend: [], has_sufficient_data: false });
  const [exceptions, setExceptions] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Transaction Explorer Table States
  const [items, setItems] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [qualityFilter, setQualityFilter] = useState('ALL');
  const [exceptionFilter, setExceptionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspection Modal States
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Ref to scroll to Explorer
  const explorerRef = useRef(null);

  // Load Overview KPIs, Quality, Trends, and Exceptions
  const loadMetrics = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoadingMetrics(true);

    try {
      const [sumRes, qualRes, trendRes, excRes] = await Promise.all([
        adminService.getTransactionSummary(dateRange),
        adminService.getTransactionQuality(dateRange),
        adminService.getTransactionTrends(dateRange),
        adminService.getTransactionExceptions(dateRange),
      ]);

      setSummary(sumRes?.data || sumRes || null);
      setQuality(qualRes?.data || qualRes || null);
      setTrends(trendRes?.data || trendRes || { processing_trend: [], quality_trend: [], has_sufficient_data: false });
      const excData = excRes?.data || excRes || {};
      setExceptions(excData.items || []);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load transaction metrics:', err);
      showToast.error('Failed to load transaction data.');
    } finally {
      setLoadingMetrics(false);
      setRefreshing(false);
    }
  };

  // Load Paginated Explorer Transactions
  const loadExplorer = async () => {
    setLoadingTable(true);
    try {
      const res = await adminService.getTransactions({
        search,
        status_filter: statusFilter,
        quality_filter: qualityFilter,
        exception_type: exceptionFilter,
        range: dateRange,
        page,
        page_size: pageSize,
      });
      const data = res?.data || res || {};
      setItems(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showToast.error('Failed to load transactions.');
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  useEffect(() => {
    loadExplorer();
  }, [dateRange, search, statusFilter, qualityFilter, exceptionFilter, page]);

  const handleRefresh = () => {
    loadMetrics(true);
    loadExplorer();
  };

  // When clicking [Investigate →] on an exception card
  const handleInvestigateException = (actionFilter) => {
    setDateRange('all');
    if (actionFilter === 'INVALID_DATE' || actionFilter === 'FUTURE_DATE') {
      setExceptionFilter('INVALID_DATE');
      setQualityFilter('INVALID');
    } else if (actionFilter === 'DUPLICATE') {
      setExceptionFilter('DUPLICATE');
      setQualityFilter('ALL');
    } else if (actionFilter === 'INVALID_AMOUNT') {
      setExceptionFilter('INVALID_AMOUNT');
      setQualityFilter('INVALID');
    } else if (actionFilter === 'UNCATEGORIZED') {
      setExceptionFilter('UNCATEGORIZED');
      setQualityFilter('WARNING');
    } else {
      setExceptionFilter(actionFilter);
    }

    setPage(1);
    if (explorerRef.current) {
      explorerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setQualityFilter('ALL');
    setExceptionFilter('ALL');
    setPage(1);
  };

  const handleInspect = (id) => {
    setSelectedTxId(id);
    setIsDetailOpen(true);
  };

  const s = summary || {
    total_processed: 0,
    successful_count: 0,
    needs_review_count: 0,
    failed_count: 0,
    duplicate_count: 0,
    success_rate_pct: 0,
    needs_review_pct: 0,
    failed_pct: 0,
    duplicate_pct: 0,
    avg_processing_time_ms: 0,
    processed_change_pct: null,
  };

  const q = quality || {
    overall_data_quality: 100,
    quality_score_formula: '30% Categorization + 20% Merchant Resolution + 25% Valid Amount + 20% Valid Date + 5% Uniqueness',
    categorized_pct: 100,
    uncategorized_count: 0,
    valid_amount_pct: 100,
    invalid_amount_count: 0,
    valid_date_pct: 100,
    future_date_count: 0,
    merchant_recognized_pct: 100,
    missing_merchant_count: 0,
    duplicate_candidates_pct: 0,
    duplicate_candidates_count: 0,
  };

  // Compute pagination range text
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  // Determine overall score grade
  const overallScore = q.overall_data_quality ?? 100;
  const getQualityGrade = (score) => {
    if (score >= 90) return { label: 'Excellent Quality', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
    if (score >= 75) return { label: 'Good Quality', color: 'text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' };
    if (score >= 50) return { label: 'Needs Improvement', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
    return { label: 'Critical Attention Required', color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400' };
  };
  const qualityGrade = getQualityGrade(overallScore);

  const processingTrendData = trends?.processing_trend || [];
  const qualityTrendData = trends?.quality_trend || [];
  const hasProcessingTrend = processingTrendData.length >= 2;
  const hasQualityTrend = qualityTrendData.length >= 2;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-14 text-slate-100">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white font-outfit">
              Transaction Operations
            </h1>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Data Quality Center
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operational monitoring, data quality benchmarks, pipeline diagnostics, and exception management.
          </p>
        </div>

        {/* Global Admin Controls */}
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setDateRange(r.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dateRange === r.id
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh metrics and explorer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Global Pipeline Status Banner ── */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold tracking-wide uppercase font-outfit text-white">
                Transaction Ingestion Pipeline: Active & Operational
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Healthy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              All incoming financial transactions are parsed, integrity-verified, and categorized deterministically.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-5">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Window</span>
            <span className="text-slate-200 font-bold">{dateRange.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Evaluated</span>
            <span className="text-white font-bold">{s.total_processed.toLocaleString()} txs</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Clean Ratio</span>
            <span className="text-emerald-400 font-bold">{s.success_rate_pct}%</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Latency</span>
            <span className="text-indigo-400 font-bold">{s.avg_processing_time_ms || '<5'} ms</span>
          </div>
          {lastUpdated && (
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Last Updated</span>
              <span className="text-slate-400">{lastUpdated}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 1: Processing Overview KPIs (6 Cards) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Processing Overview</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">Real-time DB aggregates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: Total Transactions */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors space-y-1.5 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Total Ingested</span>
            <p className="text-2xl font-bold text-white font-mono">{s.total_processed.toLocaleString()}</p>
            <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
              {s.processed_change_pct !== null ? (
                <span className={s.processed_change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {s.processed_change_pct >= 0 ? `+${s.processed_change_pct}%` : `${s.processed_change_pct}%`} vs prev
                </span>
              ) : (
                <span className="text-slate-500">Volume in active window</span>
              )}
            </div>
          </div>

          {/* Card 2: Successfully Processed */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 block">Processed</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {s.success_rate_pct}%
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{s.successful_count.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-mono block">Passed all schema checks</span>
          </div>

          {/* Card 3: Needs Review */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 block">Needs Review</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {s.needs_review_pct}%
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-400 font-mono">{s.needs_review_count.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-mono block">Missing tags or category</span>
          </div>

          {/* Card 4: Failed */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 block">Failed</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {s.failed_pct}%
              </span>
            </div>
            <p className="text-2xl font-bold text-rose-400 font-mono">{s.failed_count.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-mono block">Invalid/zero amount bounds</span>
          </div>

          {/* Card 5: Duplicate Candidates */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 block">Duplicates</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {s.duplicate_pct}%
              </span>
            </div>
            <p className="text-2xl font-bold text-violet-400 font-mono">{s.duplicate_count.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-mono block">Matching signature hashes</span>
          </div>

          {/* Card 6: Operational Latency */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 block">Query Latency</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Optimal
              </span>
            </div>
            <p className="text-2xl font-bold text-sky-400 font-mono">{s.avg_processing_time_ms || '<5'} <span className="text-xs font-normal text-slate-400">ms</span></p>
            <span className="text-[10px] text-slate-500 font-mono block">SQL aggregation latency</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Data Quality Metrics & Scoring Breakdown ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Data Quality Benchmarks</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic platform health formula evaluating schema compliance, normalization, and deduplication.
            </p>
          </div>
        </div>

        {/* Top Overall Quality Score Card */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900/70 to-zinc-950 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-black font-mono text-white">
                  {overallScore}%
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-sm font-bold text-white">Overall Platform Data Quality Index</h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${qualityGrade.badge}`}>
                    {qualityGrade.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Weighted deterministic score calculated directly from transaction database integrity constraints.
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <span className="text-slate-500">Status: </span>
              <span className="text-emerald-400 font-semibold">Active Ingestion Monitoring</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, overallScore))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Formula: {q.quality_score_formula}</span>
              <span>100% Target</span>
            </div>
          </div>
        </div>

        {/* 5 Core Health Diagnostic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Diagnostic 1: Categorization */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Categorization Rate</span>
            <p className="text-xl font-bold text-white font-mono">{q.categorized_pct}%</p>
            <span className="text-[11px] text-slate-500 font-mono block">
              {q.uncategorized_count} uncategorized
            </span>
          </div>

          {/* Diagnostic 2: Valid Amounts */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Amount Validity</span>
            <p className="text-xl font-bold text-white font-mono">{q.valid_amount_pct}%</p>
            <span className="text-[11px] text-slate-500 font-mono block">
              {q.invalid_amount_count} invalid / non-positive
            </span>
          </div>

          {/* Diagnostic 3: Valid Dates */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Date Validity</span>
            <p className={`text-xl font-bold font-mono ${q.valid_date_pct < 80 ? 'text-amber-400' : 'text-white'}`}>
              {q.valid_date_pct}%
            </p>
            <span className="text-[11px] text-slate-500 font-mono block">
              {q.future_date_count} invalid / future dated
            </span>
          </div>

          {/* Diagnostic 4: Merchant Resolution */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Merchant Resolved</span>
            <p className="text-xl font-bold text-white font-mono">{q.merchant_recognized_pct}%</p>
            <span className="text-[11px] text-slate-500 font-mono block">
              {q.missing_merchant_count} unresolved
            </span>
          </div>

          {/* Diagnostic 5: Data Uniqueness */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Data Uniqueness</span>
            <p className="text-xl font-bold text-white font-mono">
              {(100 - (q.duplicate_candidates_pct || 0)).toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-500 font-mono block">
              {q.duplicate_candidates_count} duplicates detected
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 3: Dual Trend Visualizations (Processing + Quality) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Processing Throughput Trend */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit flex items-center space-x-2">
                <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                <span>Processing Throughput & Classification</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                Volume of transactions ingested, verified, and flagged over time.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {processingTrendData.length} records
            </span>
          </div>

          <div className="h-64 w-full">
            {hasProcessingTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="processedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="processed" name="Total Ingested" stroke="#0EA5E9" strokeWidth={2} fill="url(#processedGrad)" />
                  <Area type="monotone" dataKey="successful" name="Verified" stroke="#10B981" strokeWidth={1.5} fill="url(#successGrad)" />
                  <Line type="monotone" dataKey="needs_review" name="Needs Review" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="failed" name="Failed" stroke="#F43F5E" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Database className="w-8 h-8 opacity-40" />
                <p className="text-xs font-mono">
                  {dateRange === 'all' ? 'Insufficient time-series data.' : 'No trend points recorded for this window.'}
                </p>
                {dateRange !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setDateRange('all')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                  >
                    Switch to All Time
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Data Quality Compliance Trend */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit flex items-center space-x-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Data Quality Compliance Trend (%)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                Chronological integrity rates for categorization, dates, and amounts.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              0-100% Scale
            </span>
          </div>

          <div className="h-64 w-full">
            {hasQualityTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <RechartsTooltip content={<ChartTooltip isRate={true} />} />
                  <Line type="monotone" dataKey="categorized_rate" name="Categorized %" stroke="#6366F1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valid_amount_rate" name="Valid Amount %" stroke="#10B981" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="valid_date_rate" name="Valid Date %" stroke="#0EA5E9" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="merchant_rate" name="Merchant %" stroke="#A855F7" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Database className="w-8 h-8 opacity-40" />
                <p className="text-xs font-mono">
                  {dateRange === 'all' ? 'Insufficient time-series quality data.' : 'No quality trend points recorded for this window.'}
                </p>
                {dateRange !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setDateRange('all')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                  >
                    Switch to All Time
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: Anomaly & Exception Center ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Attention & Integrity Exceptions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rule violations and integrity exceptions requiring administrative review.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {exceptions.length} {exceptions.length === 1 ? 'issue' : 'issues'} flagged
          </span>
        </div>

        {exceptions.length > 0 ? (
          <div className="space-y-2.5">
            {exceptions.map((exc) => {
              const isHigh = exc.severity === 'HIGH' || exc.severity === 'CRITICAL';
              return (
                <div
                  key={exc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isHigh ? 'text-rose-400' : 'text-amber-400'}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-white">{exc.title}</h3>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          isHigh
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {exc.severity || 'WARNING'}
                        </span>
                        {exc.affected_count > 0 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            ({exc.affected_count} affected)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{exc.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInvestigateException(exc.action_filter)}
                    className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors flex-shrink-0 border border-zinc-700/50"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20 flex items-center space-x-2.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">
              All transaction integrity checks passing — no anomalies or rule violations detected for this period.
            </span>
          </div>
        )}
      </div>

      {/* ── Section 5: Transaction Explorer (Bottom Section) ── */}
      <div ref={explorerRef} className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Transaction Explorer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter, search, and drill-down into individual transaction records.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Server-side paginated ({totalCount.toLocaleString()} total)
          </span>
        </div>

        {/* Search & Filters */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search reference, merchant, title, or user..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Quality Filter */}
            <div>
              <select
                value={qualityFilter}
                onChange={(e) => { setQualityFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="ALL">All Quality</option>
                <option value="VALID">Valid</option>
                <option value="INVALID">Invalid</option>
                <option value="WARNING">Warning</option>
              </select>
            </div>

            {/* Exception Filter */}
            <div>
              <select
                value={exceptionFilter}
                onChange={(e) => { setExceptionFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="ALL">All Exceptions</option>
                <option value="INVALID_DATE">Invalid Date</option>
                <option value="DUPLICATE">Duplicate</option>
                <option value="MISSING_DATA">Missing Data</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Option if any filter is active */}
          {(search || statusFilter !== 'ALL' || qualityFilter !== 'ALL' || exceptionFilter !== 'ALL') && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden">
          {loadingTable ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              <p className="text-xs text-slate-500 font-mono">Loading transactions...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-zinc-950">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Quality</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {items.map((tx) => {
                    const isInc = tx.type === 'INCOME';

                    return (
                      <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {tx.transaction_number || tx.id.slice(0, 8)}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-white">{tx.user_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{tx.user_email}</p>
                        </td>
                        <td className="py-2.5 px-4 text-slate-200">
                          {tx.merchant || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">
                          {tx.category || 'Uncategorized'}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="text-slate-300">{tx.date}</span>
                          {tx.is_future_dated && (
                            <span className="ml-1.5 text-[9px] font-semibold text-amber-400">
                              (Future)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            tx.data_quality === 'Verified' || tx.data_quality === 'Valid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : tx.data_quality === 'Invalid'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {tx.data_quality}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            tx.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : tx.status === 'Failed'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <span className={`font-mono font-bold ${
                            isInc ? 'text-emerald-400' : 'text-slate-200'
                          }`}>
                            {isInc ? '+' : '−'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleInspect(tx.id)}
                            className="p-1 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors"
                            title="Inspect Transaction"
                          >
                            <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-slate-400">
                {search || statusFilter !== 'ALL' || qualityFilter !== 'ALL' || exceptionFilter !== 'ALL'
                  ? 'No transactions match the selected filters.'
                  : dateRange === 'today'
                  ? 'No transactions recorded for Today.'
                  : dateRange === '7d'
                  ? 'No transactions recorded in the last 7 days.'
                  : dateRange === '30d'
                  ? 'No transactions recorded in the last 30 days.'
                  : 'No transactions found.'}
              </p>
              {(dateRange !== 'all' || search || statusFilter !== 'ALL' || qualityFilter !== 'ALL' || exceptionFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setDateRange('all');
                    handleResetFilters();
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-slate-300 transition-colors"
                >
                  <span>View All Transactions</span>
                </button>
              )}
            </div>
          )}

          {/* Server-Side Pagination Footer */}
          {totalCount > 0 && (
            <div className="p-3.5 border-t border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-white">{startItem}–{endItem}</strong> of <strong className="text-white">{totalCount}</strong> records
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-0.5 text-xs font-mono text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Inspection Modal ── */}
      <AdminTransactionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transactionId={selectedTxId}
        onActionCompleted={() => {
          loadMetrics();
          loadExplorer();
        }}
      />
    </div>
  );
};

export default AdminTransactions;
