import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import categoryService from '../../services/categoryService.js';
import CategoryIconPicker from './CategoryIconPicker.jsx';
import CategoryColorPicker from './CategoryColorPicker.jsx';

export const CategoryForm = ({
  isOpen,
  onClose,
  initialData = null,
  categories = [],   // all existing categories for parent selector
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#6366F1');

  const isEdit = !!initialData?.id;

  const [selectedParentId, setSelectedParentId] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category_name: '',
      category_type: 'EXPENSE',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        category_name: initialData.category_name || '',
        category_type: initialData.category_type || 'EXPENSE',
        description: initialData.description || '',
      });
      setSelectedIcon(initialData.icon || 'Tag');
      setSelectedColor(initialData.color || '#6366F1');
      setSelectedParentId(initialData.parent_id || '');
    } else {
      reset({
        category_name: '',
        category_type: 'EXPENSE',
        description: '',
      });
      setSelectedIcon('Tag');
      setSelectedColor('#6366F1');
      setSelectedParentId('');
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        category_name: data.category_name,
        category_type: data.category_type,
        icon: selectedIcon,
        color: selectedColor,
        description: data.description || null,
        is_default: false,
        parent_id: selectedParentId || null,
      };

      if (isEdit) {
        await categoryService.updateCategory(initialData.id, payload);
        toast.success('Category updated successfully!', { icon: '✏️' });
      } else {
        await categoryService.createCategory(payload);
        toast.success('New Category created successfully!', { icon: '🏷️' });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save category.');
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
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Category' : 'Create Custom Category'}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Name & Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category Name
              </label>
              <input
                type="text"
                placeholder="Subscriptions, Groceries..."
                {...register('category_name', { required: 'Category name is required' })}
                className={`w-full rounded-xl border py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                  errors.category_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20'
                }`}
              />
              {errors.category_name && <p className="text-[11px] text-red-500">{errors.category_name.message}</p>}
            </div>

            {/* Parent Category (makes this a sub-category) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Parent Category
                <span className="ml-1 text-slate-400 normal-case font-normal">(optional — makes this a sub-category)</span>
              </label>
              <select
                value={selectedParentId}
                onChange={e => setSelectedParentId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
              >
                <option value="">— None (top-level category) —</option>
                {categories
                  .filter(c => !c.parent_id && (!initialData || c.id !== initialData.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.category_name} ({c.category_type})
                    </option>
                  ))}
              </select>
              {selectedParentId && (
                <p className="text-[10px] text-indigo-400 mt-1">
                  ✓ This will be a sub-category. Budgets can target it independently from the parent.
                </p>
              )}
            </div>

            {/* Category Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category Type
              </label>
              <select
                {...register('category_type')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
              >
                <option value="EXPENSE">Expense (-)</option>
                <option value="INCOME">Income (+)</option>
                <option value="INVESTMENT">Investment (📈)</option>
                <option value="TRANSFER">Transfer (⇄)</option>
              </select>
            </div>

            {/* Icon Picker */}
            <CategoryIconPicker
              selectedIcon={selectedIcon}
              onSelectIcon={setSelectedIcon}
            />

            {/* Color Picker */}
            <CategoryColorPicker
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Category notes or purpose..."
                {...register('description')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Submit & Cancel */}
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
                    {isEdit ? 'Save Changes' : 'Create Category'}
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

export default CategoryForm;
