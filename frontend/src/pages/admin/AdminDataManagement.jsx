import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tag,
  RefreshCw,
  Loader2,
  Filter,
  PlusCircle,
  Trash2,
  Search,
  X,
  AlertTriangle,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminDataManagement = () => {
  const [loading, setLoading] = useState(true);

  // ── Categorization Rules State ──
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSearch, setRulesSearch] = useState('');
  const [rulesCategory, setRulesCategory] = useState('');
  const [rulesStatus, setRulesStatus] = useState('ALL');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteConfirmRule, setDeleteConfirmRule] = useState(null);

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 25, 50, 100, or 'ALL'

  const [ruleForm, setRuleForm] = useState({
    merchant_pattern: '',
    category: 'Food & Dining',
    match_type: 'Pattern',
    is_active: true,
  });
  const [submittingRule, setSubmittingRule] = useState(false);

  // ── Fetch All Categorization Rules ──
  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      // Fetch all rules from PostgreSQL
      const res = await adminService.getCategorizationRules({});
      setRules(res.rules || []);
      if (res.categories && res.categories.length > 0) {
        setAvailableCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categorization rules:', err);
      showToast.error('Failed to load categorization rules.');
    } finally {
      setRulesLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [rulesSearch, rulesCategory, rulesStatus, pageSize]);

  // ── Filtered Rules (Instant in-memory search across all 349+ rules) ──
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      // 1. Search filter
      if (rulesSearch.trim()) {
        const query = rulesSearch.trim().toLowerCase();
        const patternMatch = (r.merchant_pattern || '').toLowerCase().includes(query);
        const catMatch = (r.category || '').toLowerCase().includes(query);
        if (!patternMatch && !catMatch) return false;
      }
      // 2. Category filter
      if (rulesCategory && r.category !== rulesCategory) {
        return false;
      }
      // 3. Status filter
      if (rulesStatus === 'ACTIVE' && !r.is_active) return false;
      if (rulesStatus === 'DISABLED' && r.is_active) return false;

      return true;
    });
  }, [rules, rulesSearch, rulesCategory, rulesStatus]);

  // ── Paginated Slice ──
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(filteredRules.length / Number(pageSize)));
  const paginatedRules = useMemo(() => {
    if (pageSize === 'ALL') return filteredRules;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredRules.slice(start, start + size);
  }, [filteredRules, currentPage, pageSize]);

  const activeRulesCount = useMemo(() => {
    return rules.filter((r) => r.is_active).length;
  }, [rules]);

  // ── Handle Rule CRUD ──
  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!ruleForm.merchant_pattern.trim()) {
      showToast.error('Please enter a merchant pattern.');
      return;
    }
    setSubmittingRule(true);
    try {
      if (editingRule) {
        await adminService.updateCategorizationRule(editingRule.id, ruleForm);
        showToast.success(`Rule "${ruleForm.merchant_pattern}" updated successfully.`);
      } else {
        await adminService.createCategorizationRule(ruleForm);
        showToast.success(`Rule "${ruleForm.merchant_pattern}" created successfully.`);
      }
      setShowAddModal(false);
      setEditingRule(null);
      setRuleForm({ merchant_pattern: '', category: 'Food & Dining', match_type: 'Pattern', is_active: true });
      loadRules();
    } catch (err) {
      console.error('Failed to save rule:', err);
      showToast.error(err?.response?.data?.detail || 'Failed to save rule.');
    } finally {
      setSubmittingRule(false);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      const nextState = !rule.is_active;
      await adminService.updateCategorizationRule(rule.id, { is_active: nextState });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_active: nextState } : r))
      );
      showToast.success(`Rule "${rule.merchant_pattern}" ${nextState ? 'enabled' : 'disabled'}.`);
    } catch {
      showToast.error('Failed to toggle rule state.');
    }
  };

  const handleConfirmDeleteRule = async () => {
    if (!deleteConfirmRule) return;
    try {
      await adminService.deleteCategorizationRule(deleteConfirmRule.id);
      setRules((prev) => prev.filter((r) => r.id !== deleteConfirmRule.id));
      showToast.info('Categorization rule deleted.');
    } catch {
      showToast.error('Failed to delete rule.');
    } finally {
      setDeleteConfirmRule(null);
    }
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      merchant_pattern: rule.merchant_pattern,
      category: rule.category,
      match_type: rule.match_type || 'Pattern',
      is_active: rule.is_active,
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        <p className="text-xs text-slate-400">Loading categorization rules…</p>
      </div>
    );
  }

  const startRecord = filteredRules.length === 0 ? 0 : pageSize === 'ALL' ? 1 : (currentPage - 1) * Number(pageSize) + 1;
  const endRecord = pageSize === 'ALL' ? filteredRules.length : Math.min(currentPage * Number(pageSize), filteredRules.length);

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base font-black text-white font-outfit">Categorization Rules</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {rules.length} Total Rules ({activeRulesCount} Active)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live deterministic rules applied immediately to categorize all user transactions and statements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingRule(null);
              setRuleForm({ merchant_pattern: '', category: 'Food & Dining', match_type: 'Pattern', is_active: true });
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Rule</span>
          </button>

          <button
            onClick={loadRules}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-[#09090B]">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by merchant pattern or category..."
              value={rulesSearch}
              onChange={(e) => setRulesSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {rulesSearch && (
              <button
                onClick={() => setRulesSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={rulesCategory}
            onChange={(e) => setRulesCategory(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Categories ({availableCategories.length})</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={rulesStatus}
            onChange={(e) => setRulesStatus(e.target.value)}
            className="w-full sm:w-36 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 self-end lg:self-auto text-xs text-slate-400">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="py-1.5 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value="ALL">Show All ({filteredRules.length})</option>
          </select>
        </div>
      </div>

      {/* ── Rules Table ── */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Merchant Pattern</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Match Type</th>
                <th className="py-3.5 px-4 text-center">Transactions Matched</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-sans">
              {rulesLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-mono text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
                    Loading categorization rules…
                  </td>
                </tr>
              ) : paginatedRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="w-8 h-8 text-zinc-700" />
                      <p className="text-slate-400 text-xs font-medium">
                        {rulesSearch || rulesCategory || rulesStatus !== 'ALL'
                          ? 'No categorization rules match your filter criteria.'
                          : 'No categorization rules found in the database.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRules.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-teal-300 text-[11px] inline-block max-w-md truncate">
                        {r.merchant_pattern}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">{r.category}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-300">
                        {r.match_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">
                      {r.usage_count > 0 ? (
                        <span className="text-emerald-400 font-bold">{r.usage_count.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-600">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-slate-400 border-zinc-700/60'
                        }`}
                      >
                        {r.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleToggleRule(r)}
                          className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                        >
                          {r.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmRule(r)}
                          className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination Controls ── */}
        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{startRecord}</span> to{' '}
            <span className="font-bold text-white">{endRecord}</span> of{' '}
            <span className="font-bold text-white">{filteredRules.length}</span> rules
          </div>

          {pageSize !== 'ALL' && totalPages > 1 && (
            <div className="flex items-center space-x-2 self-center sm:self-auto">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2 py-1 text-slate-300 font-mono text-xs">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#09090B] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-outfit">
                {editingRule ? 'Edit Categorization Rule' : 'New Categorization Rule'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Merchant Pattern</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy|Zomato or Netflix"
                  value={ruleForm.merchant_pattern}
                  onChange={(e) => setRuleForm({ ...ruleForm, merchant_pattern: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                  Separate multiple aliases with a pipe | (e.g. Swiggy|Zomato)
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Category</label>
                <select
                  value={ruleForm.category}
                  onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {(availableCategories.length > 0
                    ? availableCategories
                    : [
                        'Food & Dining', 'Groceries', 'Transportation', 'Shopping',
                        'Entertainment', 'Healthcare', 'Housing & Utilities', 'Investments', 'Education',
                      ]
                  ).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Match Type</label>
                <select
                  value={ruleForm.match_type}
                  onChange={(e) => setRuleForm({ ...ruleForm, match_type: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Pattern">Pattern (contains substring or alias)</option>
                  <option value="Exact">Exact match</option>
                  <option value="Regex">Regular expression</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rule_active"
                  checked={ruleForm.is_active}
                  onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                  className="rounded border-zinc-800 text-teal-500 focus:ring-teal-500 bg-zinc-900 cursor-pointer"
                />
                <label htmlFor="rule_active" className="text-slate-300 font-medium cursor-pointer">
                  Enable rule immediately for user transactions
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRule}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs disabled:opacity-50 cursor-pointer"
                >
                  {submittingRule ? 'Saving…' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#09090B] p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-outfit">Delete categorization rule?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This rule will be permanently deleted from the database. Future user transactions matching{' '}
                  <span className="font-mono text-rose-300">"{deleteConfirmRule.merchant_pattern}"</span>{' '}
                  will no longer be auto-categorized by this rule.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setDeleteConfirmRule(null)}
                className="px-3.5 py-2 rounded-xl border border-zinc-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRule}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataManagement;
