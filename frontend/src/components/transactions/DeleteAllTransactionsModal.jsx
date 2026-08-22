import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import transactionService from '../../services/transactionService.js';

export const DeleteAllTransactionsModal = ({ isOpen, onClose, onSuccess, totalCount = 0 }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAll = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      toast.warning('Please type "DELETE" to confirm permanent deletion.');
      return;
    }

    setLoading(true);
    try {
      const res = await transactionService.deleteAllTransactions();
      toast.success(res?.message || 'All transactions deleted successfully.');
      
      // Clear caches
      try {
        sessionStorage.removeItem('tx_cache_items');
        sessionStorage.removeItem('tx_cache_summary');
      } catch {}

      window.dispatchEvent(new CustomEvent('ledger_updated', { detail: { cleared: true } }));
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to delete transactions.');
    } finally {
      setLoading(false);
      setConfirmText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#09090B] border border-rose-900/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(225,29,72,0.15)] text-slate-100 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center flex-shrink-0 text-rose-400">
            <Trash2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Delete All Transactions?</h3>
            <p className="text-xs text-rose-400 font-medium">Irreversible Ledger Reset</p>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-950/20 text-xs text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>Warning: Permanent Deletion</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            This will permanently remove <strong className="text-white">{totalCount > 0 ? `${totalCount} transaction(s)` : 'all transactions'}</strong> from your database ledger and reset your income, expenses, and budget spent totals to ₹0.00.
          </p>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono uppercase"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={loading || confirmText.trim().toUpperCase() !== 'DELETE'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting All...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Wipe All Transactions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAllTransactionsModal;
