import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save, PieChart, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

import budgetService from '../../services/budgetService.js';

export const BudgetForm = ({
  isOpen,
  onClose,
  initialData = null,
  categories = [],
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData?.id;

  const getFirstAndLastDayOfMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
  };

  const { firstDay, lastDay } = getFirstAndLastDayOfMonth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      budget_name: '',
      category_id: '',
      budget_amount: '',
      start_date: firstDay,
      end_date: lastDay,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        budget_name: initialData.budget_name || '',
        category_id: initialData.category_id || '',
        budget_amount: initialData.budget_amount || '',
        start_date: initialData.start_date || firstDay,
        end_date: initialData.end_date || lastDay,
      });
    } else {
      reset({
        budget_name: '',
        category_id: '',
        budget_amount: '',
        start_date: firstDay,
        end_date: lastDay,
      });
    }
  }, [initialData, reset, isOpen, firstDay, lastDay]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        budget_name: data.budget_name,
        category_id: data.category_id || null,
        budget_amount: parseFloat(data.budget_amount),
        start_date: data.start_date,
        end_date: data.end_date,
      };

      if (isEdit) {
        await budgetService.updateBudget(initialData.id, payload);
        toast.success('Budget allocation updated successfully!', { icon: '✏️' });
      } else {
        await budgetService.createBudget(payload);
        toast.success('New Budget created successfully!', { icon: '🎯' });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save budget allocation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden font-sans"
        >
          {/* Top Glow Ambient Effect */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                <PieChart className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-outfit tracking-tight">
                  {isEdit ? 'Edit Envelope Budget' : 'Set Category Budget'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Allocate monthly spending limits and limits tracking
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#14151B] hover:bg-zinc-800 border border-zinc-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Budget Title */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                Budget Title
              </label>
              <input
                type="text"
                placeholder="Monthly Dining, Groceries Limit..."
                {...register('budget_name', { required: 'Budget title is required' })}
                className={`w-full rounded-xl bg-[#12131A] border py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition-all font-sans ${
                  errors.budget_name ? 'border-rose-500' : 'border-zinc-800'
                }`}
              />
              {errors.budget_name && <p className="text-[10px] text-rose-400 font-medium">{errors.budget_name.message}</p>}
            </div>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                Target Category
              </label>

              <select
                {...register('category_id')}
                className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-400/80 transition-all font-sans cursor-pointer"
              >
                <option value="" className="bg-[#12131A] text-slate-400">
                  — All spending (no category filter) —
                </option>

                {(Array.isArray(categories) ? categories : [])
                  .filter(c => c && !c.parent_id)
                  .map(parent => {
                    const subs = (Array.isArray(categories) ? categories : []).filter(c => c && c.parent_id === parent.id);
                    return (
                      <React.Fragment key={parent.id}>
                        <option value={parent.id} className="bg-[#12131A] text-white font-bold">
                          {parent.category_name} ({parent.category_type})
                        </option>
                        {subs.map(sub => (
                          <option key={sub.id} value={sub.id} className="bg-[#12131A] text-slate-300">
                            {'  ↳ '}{sub.category_name}
                          </option>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </select>

              {/* Scope Explanation Badge Callout */}
              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-2.5 text-[10px] text-cyan-300 flex items-start space-x-2 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">
                  Selecting a <strong className="text-white">parent category</strong> tracks all related expenses. Select a <strong className="text-white">sub-category</strong> for specific envelope tracking.
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                Allocated Amount (₹)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-black text-emerald-400 font-outfit pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  {...register('budget_amount', {
                    required: 'Budget amount is required',
                    min: { value: 1, message: 'Amount must be greater than 0' },
                  })}
                  className={`w-full rounded-xl bg-[#12131A] border py-2.5 pl-8 pr-3.5 text-xs font-black text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition-all font-outfit ${
                    errors.budget_amount ? 'border-rose-500' : 'border-zinc-800'
                  }`}
                />
              </div>
              {errors.budget_amount && <p className="text-[10px] text-rose-400 font-medium">{errors.budget_amount.message}</p>}
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400/80 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('end_date', { required: 'End date is required' })}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400/80 transition-all font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-[#14151B] hover:bg-zinc-800 text-slate-300 hover:text-white text-xs font-bold font-outfit transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all font-outfit cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-slate-950 stroke-[2.5]" />
                    <span>{isEdit ? 'Save Changes' : 'Set Budget'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BudgetForm;
