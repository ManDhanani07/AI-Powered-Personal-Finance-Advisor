import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save, Sparkles, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import transactionService from '../../services/transactionService.js';
import budgetService from '../../services/budgetService.js';
import TransactionValidationModal from '../budgets/TransactionValidationModal.jsx';

const MERCHANT_SUGGESTIONS = {
  // Food & Dining
  mcdonald: 'Food & Dining',
  starbucks: 'Food & Dining',
  zomato: 'Food & Dining',
  swiggy: 'Food & Dining',
  domino: 'Food & Dining',
  pizzahut: 'Food & Dining',
  kfc: 'Food & Dining',
  burgerking: 'Food & Dining',
  subway: 'Food & Dining',
  cafe: 'Food & Dining',
  restaurant: 'Food & Dining',
  blinkit: 'Food & Dining',
  zepto: 'Food & Dining',
  instamart: 'Food & Dining',
  bigbasket: 'Food & Dining',
  dmart: 'Food & Dining',

  // Transportation & Fuel
  uber: 'Transportation',
  ola: 'Transportation',
  rapido: 'Transportation',
  irctc: 'Transportation',
  makemytrip: 'Transportation',
  indigo: 'Transportation',
  redbus: 'Transportation',
  petrol: 'Transportation',
  shell: 'Transportation',
  hpcl: 'Transportation',
  bpcl: 'Transportation',
  iocl: 'Transportation',
  fuel: 'Transportation',

  // Shopping & Retail
  amazon: 'Shopping',
  flipkart: 'Shopping',
  myntra: 'Shopping',
  ajio: 'Shopping',
  meesho: 'Shopping',
  zara: 'Shopping',
  hm: 'Shopping',
  croma: 'Shopping',
  reliance: 'Shopping',
  apple: 'Shopping',
  nike: 'Shopping',
  adidas: 'Shopping',
  puma: 'Shopping',
  decathlon: 'Shopping',
  clothes: 'Shopping',
  shoes: 'Shopping',

  // Healthcare & Pharmacy
  apollo: 'Healthcare',
  pharmeasy: 'Healthcare',
  tata1mg: 'Healthcare',
  netmeds: 'Healthcare',
  medplus: 'Healthcare',
  medical: 'Healthcare',
  hospital: 'Healthcare',
  pharmacy: 'Healthcare',

  // Entertainment & Subscriptions
  netflix: 'Entertainment',
  spotify: 'Entertainment',
  youtube: 'Entertainment',
  prime: 'Entertainment',
  hotstar: 'Entertainment',
  bookmyshow: 'Entertainment',
  steam: 'Entertainment',

  // Utilities & Bills
  electricity: 'Utilities',
  water: 'Utilities',
  gas: 'Utilities',
  jio: 'Utilities',
  airtel: 'Utilities',
  vodafone: 'Utilities',
  tataplay: 'Utilities',

  // Income & Salary
  salary: 'Salary',
  company: 'Salary',
  tech: 'Salary',
  freelance: 'Salary',
};

const getLocalDateTimeString = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const TransactionForm = ({
  isOpen,
  onClose,
  initialData = null,
  categories = [],
  onSuccess,
  onSubmit: externalOnSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);

  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      transaction_type: 'EXPENSE',
      category_id: '',
      merchant: '',
      payment_method: 'UPI',
      account_type: 'SAVINGS',
      transaction_date: getLocalDateTimeString(),
      description: '',
      location: '',
      notes: '',
      is_recurring: false,
    },
  });

  const watchMerchant = watch('merchant', '');
  const watchPaymentMethod = watch('payment_method', 'UPI');

  // When Payment Method is Cash, auto-set account_type to CASH
  useEffect(() => {
    if (watchPaymentMethod === 'CASH') {
      setValue('account_type', 'CASH');
    }
  }, [watchPaymentMethod, setValue]);

  // Live Auto-Merchant Recognition Detection
  useEffect(() => {
    if (!watchMerchant || isEdit) {
      setSuggestedCategory(null);
      return;
    }

    const lower = watchMerchant.toLowerCase();
    let foundCatName = null;

    for (const [key, val] of Object.entries(MERCHANT_SUGGESTIONS)) {
      if (lower.includes(key)) {
        foundCatName = val;
        break;
      }
    }

    if (foundCatName) {
      const targetCat = categories.find(
        (c) => c.category_name.toLowerCase() === foundCatName.toLowerCase()
      );
      if (targetCat) {
        setSuggestedCategory(targetCat);
        setValue('category_id', targetCat.id);
      }
    } else {
      setSuggestedCategory(null);
    }
  }, [watchMerchant, categories, isEdit, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        amount: initialData.amount || '',
        transaction_type: initialData.transaction_type || 'EXPENSE',
        category_id: initialData.category_id || '',
        merchant: initialData.merchant || '',
        payment_method: initialData.payment_method || 'UPI',
        account_type: initialData.payment_method === 'CASH' ? 'CASH' : (initialData.account_type || 'SAVINGS'),
        transaction_date: getLocalDateTimeString(initialData.transaction_date),
        description: initialData.description || '',
        location: initialData.location || '',
        notes: initialData.notes || '',
        is_recurring: initialData.is_recurring || false,
      });
    } else {
      reset({
        title: '',
        amount: '',
        transaction_type: 'EXPENSE',
        category_id: '',
        merchant: '',
        payment_method: 'UPI',
        account_type: 'SAVINGS',
        transaction_date: getLocalDateTimeString(),
        description: '',
        location: '',
        notes: '',
        is_recurring: false,
      });
    }
  }, [initialData, reset, isOpen]);

  const [validationData, setValidationData] = useState(null);
  const [pendingSaveData, setPendingSaveData] = useState(null);

  const saveTransactionDirectly = async (payload, selectedCat) => {
    setIsSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await transactionService.updateTransaction(initialData.id, payload);
        toast.success('Transaction updated successfully!', { icon: '✏️' });
      } else {
        res = await transactionService.createTransaction(payload);
        toast.success('Transaction logged successfully!', { icon: '💳' });
      }

      const savedTx = res?.data?.data || res?.data || {
        ...payload,
        id: res?.data?.id || `tx-${Date.now()}`,
        category: selectedCat || null,
      };

      if (onSuccess) onSuccess(savedTx);
      if (externalOnSubmit) externalOnSubmit(savedTx);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === data.category_id);
      const payload = {
        title: data.title,
        amount: parseFloat(data.amount),
        transaction_type: data.transaction_type,
        category_id: data.category_id || null,
        merchant: data.merchant || null,
        payment_method: data.payment_method,
        account_type: data.account_type,
        transaction_date: new Date(data.transaction_date).toISOString(),
        description: data.description || null,
        location: data.location || null,
        notes: data.notes || null,
        is_recurring: data.is_recurring,
      };

      // Check remaining budget if EXPENSE
      if (data.transaction_type === 'EXPENSE' && data.category_id) {
        try {
          const valRes = await budgetService.validateTransactionBudget({
            category_id: data.category_id,
            amount: parseFloat(data.amount),
          });
          const valData = valRes?.data || valRes;
          if (valData?.exceeds) {
            setValidationData(valData);
            setPendingSaveData({ payload, selectedCat });
            setIsSubmitting(false);
            return;
          }
        } catch (valErr) {
          console.warn('Budget validation check error:', valErr);
        }
      }

      await saveTransactionDirectly(payload, selectedCat);
    } catch (error) {
      toast.error(error.message || 'Failed to save transaction.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-outfit">
              {isEdit ? 'Edit Transaction' : 'Log New Transaction'}
            </h3>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Title & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Grocery Shopping"
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full rounded-xl border py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-2 bg-slate-950 text-white placeholder-slate-500 ${
                    errors.title ? 'border-rose-500' : 'border-slate-700 focus:border-primary-500'
                  }`}
                />
                {errors.title && <p className="text-[11px] text-rose-400 mt-0.5">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Amount (₹)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IndianRupee className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1250.00"
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' },
                    })}
                    className={`w-full rounded-xl border py-2.5 pl-8 pr-3 text-xs font-bold text-emerald-400 focus:outline-none focus:ring-2 bg-slate-950 placeholder-slate-500 ${
                      errors.amount ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-[11px] text-rose-400 mt-0.5">{errors.amount.message}</p>}
              </div>
            </div>

            {/* Type & Merchant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Transaction Type
                </label>
                <select
                  {...register('transaction_type')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="EXPENSE">Expense (-)</option>
                  <option value="INCOME">Income (+)</option>
                  <option value="TRANSFER">Transfer (⇄)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Merchant
                </label>
                <input
                  type="text"
                  placeholder="McDonald's, Uber, Amazon..."
                  {...register('merchant')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Auto Merchant Recommendation Banner */}
            {suggestedCategory && (
              <div className="flex items-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/10 p-2.5 text-xs text-primary-300">
                <Sparkles className="h-4 w-4 text-primary-400 shrink-0" />
                <span>
                  Auto-mapped merchant category to <strong>{suggestedCategory.category_name}</strong>
                </span>
              </div>
            )}

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Category
                </label>
                <select
                  {...register('category_id')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">Auto Detect Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('transaction_date', { required: 'Date is required' })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Payment Method & Account Type */}
            <div className={`grid grid-cols-1 ${watchPaymentMethod === 'CASH' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-3`}>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Payment Method
                </label>
                <select
                  {...register('payment_method')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              {watchPaymentMethod !== 'CASH' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Account Type
                  </label>
                  <select
                    {...register('account_type')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CHECKING">Checking Account</option>
                    <option value="CREDIT_CARD">Credit Card Account</option>
                    <option value="WALLET">Digital Wallet</option>
                  </select>
                </div>
              )}
            </div>

            {/* Location & Recurring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Mumbai, IN"
                  {...register('location')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_recurring')}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-primary-500 focus:ring-primary-500/20"
                  />
                  <span>Recurring Monthly Entry</span>
                </label>
              </div>
            </div>

            {/* Description & Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Notes / Memo
              </label>
              <textarea
                rows={2}
                placeholder="Additional details..."
                {...register('notes')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? 'Save Changes' : 'Log Transaction'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <TransactionValidationModal
        isOpen={!!validationData}
        onClose={() => setValidationData(null)}
        validationData={validationData}
        onSaveAnyway={() => {
          if (pendingSaveData) {
            saveTransactionDirectly(pendingSaveData.payload, pendingSaveData.selectedCat);
            setPendingSaveData(null);
          }
        }}
        onEditTransaction={() => {
          setValidationData(null);
        }}
      />
    </AnimatePresence>
  );
};

export default TransactionForm;
