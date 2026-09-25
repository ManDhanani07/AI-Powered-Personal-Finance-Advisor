import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Info,
  X,
  FileQuestion,
  Bug,
} from 'lucide-react';
import supportService from '../../services/supportService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';
import { PageContainer } from '../../components/layout/PageContainer.jsx';

const ISSUE_CATEGORIES = [
  'Transactions & Categorization',
  'Bank Statement / CSV Import',
  'AI Copilot & Financial Advice',
  'Budgets & Savings Goals',
  'Financial Health Score',
  'Account, Login & Security',
  'UI & Visual Display Bug',
  'Other Platform Issue',
];

const PRIORITIES = [
  { value: 'Low', label: 'Low — Minor suggestion or query', color: 'text-slate-400' },
  { value: 'Medium', label: 'Medium — Normal functionality issue', color: 'text-indigo-400' },
  { value: 'High', label: 'High — Important feature not working', color: 'text-amber-400' },
  { value: 'Critical', label: 'Critical — Account or financial data issue', color: 'text-rose-400' },
];

export const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, ACTIVE, RESOLVED

  // New Report Modal
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMyTickets = async () => {
    setIsRefreshing(true);
    try {
      const res = await supportService.getMyTickets();
      setTickets(res?.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      showToast.error('Failed to load your submitted reports.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || subject.trim().length < 3) {
      showToast.error('Please enter a brief issue title (at least 3 characters).');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      showToast.error('Please provide a detailed description (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await supportService.submitTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });

      showToast.success('Problem report submitted successfully! Our support team will review it.');
      setSubject('');
      setDescription('');
      setCategory(ISSUE_CATEGORIES[0]);
      setPriority('Medium');
      setShowModal(false);
      loadMyTickets();
    } catch (err) {
      console.error('Failed to submit report:', err);
      showToast.error(err.response?.data?.detail || 'Failed to submit problem report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterTab === 'ACTIVE') return ['Open', 'In Progress'].includes(t.status);
    if (filterTab === 'RESOLVED') return ['Resolved', 'Closed'].includes(t.status);
    return true;
  });

  const openCount = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status)).length;
  const resolvedCount = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;

  return (
    <PageContainer>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* ── 1. Hero Header Banner ── */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-[#09090B] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
                  Help Center & Problem Reports
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Experiencing a glitch, statement parsing error, or need help with your account? Submit a report below.
                Our administration and engineering team actively triages tickets and replies directly to your dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={loadMyTickets}
                disabled={isRefreshing}
                className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-slate-300 transition-colors disabled:opacity-50"
                title="Refresh Tickets"
              >
                <RefreshCw className={`w-4 h-4 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/20 inline-flex items-center gap-2 font-outfit"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit New Report</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-zinc-800/80">
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Submitted</span>
              <p className="text-lg font-black text-white font-mono mt-0.5">{tickets.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Open / Under Review</span>
              <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{openCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Resolved & Answered</span>
              <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* ── 2. Filter Tabs & Listing Section ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterTab === 'ALL'
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-slate-400 hover:text-white'
                }`}
              >
                All Reports ({tickets.length})
              </button>
              <button
                onClick={() => setFilterTab('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterTab === 'ACTIVE'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-slate-400 hover:text-white'
                }`}
              >
                Active ({openCount})
              </button>
              <button
                onClick={() => setFilterTab('RESOLVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterTab === 'RESOLVED'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-slate-400 hover:text-white'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Support SLAs: Critical inquiries prioritized within 2 hours
            </p>
          </div>

          {/* Listing */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-sky-400" />
              <p className="text-xs text-slate-400 font-mono">Loading your support tickets…</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 rounded-3xl border border-zinc-800 bg-[#09090B] text-center space-y-4 my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <LifeBuoy className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white font-outfit">No Problem Reports Found</h3>
                <p className="text-xs text-slate-400">
                  {filterTab === 'ALL'
                    ? 'You have not submitted any problem reports yet. If anything is not working properly, click the button below to alert our engineering team.'
                    : `No tickets matching filter '${filterTab.toLowerCase()}'.`}
                </p>
              </div>
              {filterTab === 'ALL' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report an Issue</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((t) => {
                const isCrit = t.priority === 'Critical';
                const isHigh = t.priority === 'High';
                const isMed = t.priority === 'Medium';
                const hasReply = !!t.admin_reply;

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-3xl border border-zinc-800 bg-[#09090B] space-y-4 shadow-sm hover:border-zinc-700/80 transition-all"
                  >
                    {/* Top Row: Code, Category, Status, Created */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-sky-400 text-xs px-2.5 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                          {t.ticket_code}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                          {t.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCrit
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : isHigh
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isMed
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-zinc-800 text-slate-400 border-zinc-700'
                          }`}
                        >
                          Priority: {t.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500 font-mono text-[11px]">{t.created_at}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : t.status === 'In Progress'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Subject & Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white font-outfit">{t.subject}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{t.description}</p>
                    </div>

                    {/* Bottom: Admin Response Box */}
                    {hasReply ? (
                      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <strong className="text-emerald-400 font-outfit">Official Support Response</strong>
                            {t.assigned_admin && (
                              <span className="text-slate-400 text-[11px]">from {t.assigned_admin}</span>
                            )}
                          </div>
                          {t.replied_at && (
                            <span className="text-[11px] font-mono text-slate-500">{t.replied_at}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed bg-[#09090B] p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap">
                          {t.admin_reply}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Status: Ticket received by administration. Awaiting support agent review.</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">Typical reply: &lt; 4 hours</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Submit New Problem Report Modal ── */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Bug className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white font-outfit">Report a Problem or Issue</h3>
                      <p className="text-[11px] text-slate-400">Our engineering team will review and reply directly to this ticket.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Issue Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {ISSUE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Urgency / Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject / Title */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">
                      Problem Summary / Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., CSV statement import skipped two transaction dates"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">
                      Detailed Explanation <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe what happened, what you expected, steps to reproduce, or any error messages shown on screen…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500">
                      Please avoid entering sensitive bank credentials or card CVVs.
                    </p>
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Submit Problem Report</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};

export default SupportPage;
