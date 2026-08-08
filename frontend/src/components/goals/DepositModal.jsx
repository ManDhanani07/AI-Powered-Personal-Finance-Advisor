import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, CheckCircle2, ArrowRight, Wallet, PartyPopper } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { toast } from 'react-toastify';

export const DepositModal = ({
  isOpen,
  onClose,
  goal,
  unallocatedSurplus = 0,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!goal) return null;

  const current = parseFloat(goal.current_amount) || 0;
  const target = parseFloat(goal.target_amount) || 0;

  const handleChipClick = (pct) => {
    const calc = (unallocatedSurplus * pct) / 100;
    setAmount(calc.toString());
  };

  const handleDeposit = async () => {
    const depositVal = parseFloat(amount) || 0;
    if (depositVal <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTotal = current + depositVal;
      const isReaching100 = newTotal >= target;

      if (isReaching100) {
        setShowCelebration(true);
        toast.success(`🎉 CONGRATULATIONS! Goal '${goal.goal_name}' fully achieved!`, { icon: '🏆' });
      } else {
        toast.success(`Deposited ${formatCurrency(depositVal)} to ${goal.goal_name}!`, { icon: '💳' });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess(goal.id, depositVal);
        setIsSubmitting(false);
        setShowCelebration(false);
        onClose();
      }, isReaching100 ? 2500 : 300);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Particle Celebration Banner Overlay */}
          {showCelebration && (
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 shadow-2xl text-center text-white space-y-4 max-w-sm"
              >
                <PartyPopper className="w-16 h-16 mx-auto animate-bounce" />
                <h2 className="text-3xl font-black font-outfit">Goal Accomplished!</h2>
                <p className="text-xs text-emerald-100">
                  You have successfully reached 100% of your target for {goal.goal_name}!
                </p>
              </motion.div>
            </div>
          )}

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl border border-border-strong bg-bg-surface p-6 shadow-2xl backdrop-blur-2xl space-y-5 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                      Deposit to Goal Vault
                    </h3>
                    <p className="text-xs text-slate-400">{goal.goal_name}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-bg-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Percentage Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Quick Surplus Allocation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '25% Surplus', pct: 25 },
                    { label: '50% Surplus', pct: 50 },
                    { label: '100% Surplus', pct: 100 },
                  ].map((chip) => (
                    <button
                      key={chip.pct}
                      type="button"
                      onClick={() => handleChipClick(chip.pct)}
                      className="py-2 px-3 rounded-xl border border-border-strong bg-bg-elevated/70 hover:bg-primary-500/10 hover:border-primary-500 text-xs font-bold text-slate-200 transition-all text-center"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-2xl border border-border-strong bg-bg-surface p-3 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Confirm Deposit Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositModal;
