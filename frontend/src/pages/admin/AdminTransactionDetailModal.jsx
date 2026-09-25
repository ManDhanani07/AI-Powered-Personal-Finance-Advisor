import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const AdminTransactionDetailModal = ({
  isOpen,
  onClose,
  transactionId,
  onActionCompleted,
}) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('MARK_REVIEWED');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (isOpen && transactionId) {
      loadDetail();
    } else {
      setDetail(null);
      setAdminNotes('');
    }
  }, [isOpen, transactionId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTransactionDetail(transactionId);
      const data = res?.data || res || {};
      setDetail(data);
    } catch (err) {
      console.error('Failed to load transaction detail:', err);
      showToast.error('Failed to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedAction) return;
    setActionLoading(true);
    try {
      const res = await adminService.executeTransactionAction(transactionId, {
        action: selectedAction,
        notes: adminNotes,
      });
      showToast.success(res?.message || 'Action recorded successfully.');
      setAdminNotes('');
      if (onActionCompleted) onActionCompleted();
      onClose();
    } catch (err) {
      console.error('Failed to execute action:', err);
      showToast.error(err?.response?.data?.detail || 'Failed to record action.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#09090B] shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Transaction Details</h3>
                {detail && (
                  <span className="font-mono text-[11px] text-slate-400">
                    {detail.transaction_number || detail.id}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <p className="text-xs text-slate-500 font-mono">Loading transaction...</p>
              </div>
            ) : detail ? (
              <>
                {/* 1. Transaction Info */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{detail.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Merchant: <span className="text-slate-200">{detail.merchant || '—'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold font-mono ${
                        detail.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {detail.type === 'INCOME' ? '+' : '−'}{formatCurrency(detail.amount)}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{detail.type}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Category</span>
                      <span className="text-indigo-400 font-medium">{detail.category || 'Uncategorized'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Date</span>
                      <span className="text-slate-300 font-medium">{detail.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">User</span>
                      <span className="text-slate-300">{detail.user?.name || '—'}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{detail.user?.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Method</span>
                      <span className="text-slate-300">{detail.payment_method || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Quality & Processing Status */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Quality</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${
                          detail.data_quality === 'Verified' || detail.data_quality === 'Valid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : detail.data_quality === 'Invalid'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {detail.data_quality}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Processing Status</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${
                          detail.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : detail.status === 'Failed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {detail.status}
                      </span>
                    </div>
                  </div>

                  {/* Reason for review (if any) */}
                  {detail.reasons_for_review && detail.reasons_for_review.length > 0 && (
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1.5 mt-2">
                      <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Reason for Review:</span>
                      </div>
                      <ul className="list-disc pl-5 text-xs text-amber-300/90 space-y-0.5">
                        {detail.reasons_for_review.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 3. Administrative Resolution */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Resolution Action</span>

                  <div className="flex items-center gap-2">
                    {[
                      { id: 'MARK_REVIEWED', label: 'Mark as Reviewed' },
                      { id: 'RESOLVE_ISSUE', label: 'Resolve Issue' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedAction(opt.id)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                          selectedAction === opt.id
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                            : 'border-zinc-800 bg-zinc-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Resolution notes (optional)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleExecuteAction}
                      disabled={actionLoading}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Action</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Transaction details could not be loaded.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminTransactionDetailModal;
