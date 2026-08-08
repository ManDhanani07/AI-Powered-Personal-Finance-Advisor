import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Budget' : 'Set Category Budget'}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Budget Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Budget Title
              </label>
              <input
                type="text"
                placeholder="Monthly Dining, Groceries Limit..."
                {...register('budget_name', { required: 'Budget title is required' })}
                className={`w-full rounded-xl border py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                  errors.budget_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20'
                }`}
              />
              {errors.budget_name && <p className="text-[11px] text-red-500">{errors.budget_name.message}</p>}
            </div>

            {/* Category Selector — grouped: parent categories then their sub-categories */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Category
              </label>

              <select
                {...register('category_id')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
              >
                <option value="">— All spending (no category filter) —</option>

                {/* Parent categories (no parent_id) */}
                {(Array.isArray(categories) ? categories : [])
                  .filter(c => c && !c.parent_id)
                  .map(parent => {
                    const subs = (Array.isArray(categories) ? categories : []).filter(c => c && c.parent_id === parent.id);
                    return (
                      <React.Fragment key={parent.id}>
                        <option value={parent.id}>
                          {parent.category_name} ({parent.category_type})
                        </option>
                        {subs.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {'  ↳ '}{sub.category_name}
                          </option>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </select>

              {/* Scope explanation */}
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                💡 Selecting a <strong>parent category</strong> (e.g. Shopping) tracks <em>all</em> Shopping transactions.
                Select a <strong>sub-category</strong> (e.g. ↳ Electronics) to track only Electronics spending.
                Create sub-categories in <strong>Settings → Categories</strong>.
              </p>
            </div>


            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Allocated Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="10000.00"
                {...register('budget_amount', {
                  required: 'Budget amount is required',
                  min: { value: 1, message: 'Amount must be greater than 0' },
                })}
                className={`w-full rounded-xl border py-2 px-3 text-xs font-extrabold focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                  errors.budget_amount ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20'
                }`}
              />
              {errors.budget_amount && <p className="text-[11px] text-red-500">{errors.budget_amount.message}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('end_date', { required: 'End date is required' })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? 'Save Changes' : 'Set Budget'}
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
