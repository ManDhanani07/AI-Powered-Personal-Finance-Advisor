import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Loader2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import transactionService from '../../services/transactionService.js';
import { ROUTES } from '../../constants/index.js';

export const EmptyLedgerCallout = ({ title = 'No Ledger Records Found', onSeeded }) => {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await transactionService.seedTransactions();
      toast.success('Successfully populated 12-month sample financial ledger!', { icon: '⚡' });
      if (onSeeded) onSeeded();
      else window.location.reload();
    } catch (err) {
      toast.error('Failed to seed sample ledger data.');
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl border border-border-subtle bg-bg-elevated/50 backdrop-blur-md my-2"
    >
      <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-extrabold text-white font-outfit">
          {title}
        </h4>
        <p className="text-xs text-slate-400 font-normal leading-relaxed">
          Seed your PostgreSQL ledger with 12 months of sample data or add your first live entry to unlock dynamic graphs.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 font-outfit"
        >
          {seeding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
              <span>Seeding Ledger...</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="tracking-tight">Load Sample Ledger</span>
            </>
          )}
        </button>

        <button
          onClick={() => navigate(ROUTES.TRANSACTIONS)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer font-outfit"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Transaction</span>
        </button>
      </div>
    </motion.div>
  );
};

export default EmptyLedgerCallout;
