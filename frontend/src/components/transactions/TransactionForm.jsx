import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save, Sparkles, IndianRupee, Receipt } from 'lucide-react';
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

      try {
        sessionStorage.removeItem('tx_cache_items');
        sessionStorage.removeItem('tx_cache_summary');
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('ledger_updated', { detail: savedTx }));
      window.dispatchEvent(new CustomEvent('transaction_added', { detail: savedTx }));

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar relative font-sans"
        >
          {/* Top Glow Ambient Effect — Electric Indigo Palette */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] shrink-0">
                <Receipt className="w-4.5 h-4.5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-outfit tracking-tight">
                  {isEdit ? 'Edit Transaction' : 'Log New Transaction'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Record income, expenses, or transfers to update your ledger in real-time
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
            {/* Title & Amount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Grocery Shopping"
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full rounded-xl bg-[#12131A] border py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/80 transition-all font-sans ${
                    errors.title ? 'border-rose-500' : 'border-zinc-800'
                  }`}
                />
                {errors.title && <p className="text-[10px] text-rose-400 font-medium">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Amount (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-black text-indigo-400 font-outfit pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1250.00"
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' },
                    })}
                    className={`w-full rounded-xl bg-[#12131A] border py-2.5 pl-8 pr-3.5 text-xs font-black text-indigo-300 focus:outline-none focus:border-indigo-400/80 transition-all font-outfit ${
                      errors.amount ? 'border-rose-500' : 'border-zinc-800'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-[10px] text-rose-400 font-medium">{errors.amount.message}</p>}
              </div>
            </div>

            {/* Type & Merchant Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Transaction Type
                </label>
                <select
                  {...register('transaction_type')}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-400/80 transition-all font-sans cursor-pointer"
                >
                  <option value="EXPENSE" className="bg-[#12131A] text-rose-400">Expense (-)</option>
                  <option value="INCOME" className="bg-[#12131A] text-emerald-400">Income (+)</option>
                  <option value="TRANSFER" className="bg-[#12131A] text-cyan-400">Transfer (⇄)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Merchant
                </label>
                <input
                  type="text"
                  placeholder="McDonald's, Uber, Amazon..."
                  {...register('merchant')}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/80 transition-all font-sans"
                />
              </div>
            </div>

            {/* Auto Merchant Recommendation Callout */}
            {suggestedCategory && (
              <div className="flex items-center space-x-2 rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-2.5 text-[11px] text-indigo-300 font-sans">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>
                  Auto-mapped category to <strong className="text-white font-outfit">{suggestedCategory.category_name}</strong>
                </span>
              </div>
            )}

            {/* Category & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Category
                </label>
                <select
                  {...register('category_id')}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-indigo-400/80 transition-all font-sans cursor-pointer"
                >
                  <option value="" className="bg-[#12131A] text-slate-400">Auto Detect Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#12131A] text-white font-bold">
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('transaction_date', { required: 'Date is required' })}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-indigo-400/80 transition-all font-mono"
                />
              </div>
            </div>

            {/* Payment Method & Account Type */}
            <div className={`grid grid-cols-1 ${watchPaymentMethod === 'CASH' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-3`}>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Payment Method
                </label>
                <select
                  {...register('payment_method')}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-indigo-400/80 transition-all font-sans cursor-pointer"
                >
                  <option value="UPI" className="bg-[#12131A]">UPI</option>
                  <option value="CREDIT_CARD" className="bg-[#12131A]">Credit Card</option>
                  <option value="DEBIT_CARD" className="bg-[#12131A]">Debit Card</option>
                  <option value="CASH" className="bg-[#12131A]">Cash</option>
                  <option value="BANK_TRANSFER" className="bg-[#12131A]">Bank Transfer</option>
                </select>
              </div>

              {watchPaymentMethod !== 'CASH' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                    Account Type
                  </label>
                  <select
                    {...register('account_type')}
                    className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-indigo-400/80 transition-all font-sans cursor-pointer"
                  >
                    <option value="SAVINGS" className="bg-[#12131A]">Savings Account</option>
                    <option value="CHECKING" className="bg-[#12131A]">Checking Account</option>
                    <option value="CREDIT_CARD" className="bg-[#12131A]">Credit Card Account</option>
                    <option value="WALLET" className="bg-[#12131A]">Digital Wallet</option>
                  </select>
                </div>
              )}
            </div>

            {/* Location & Recurring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Mumbai, IN"
                  {...register('location')}
                  className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/80 transition-all font-sans"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('is_recurring')}
                    className="h-4 w-4 rounded border-zinc-700 bg-[#12131A] text-indigo-500 focus:ring-indigo-500/20 accent-indigo-500"
                  />
                  <span className="font-outfit text-xs">Recurring Monthly Entry</span>
                </label>
              </div>
            </div>

            {/* Notes / Memo */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit">
                Notes / Memo
              </label>
              <textarea
                rows={2}
                placeholder="Additional details..."
                {...register('notes')}
                className="w-full rounded-xl bg-[#12131A] border border-zinc-800 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/80 transition-all font-sans custom-scrollbar"
              />
            </div>

            {/* Submit & Cancel Actions */}
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 hover:brightness-110 text-white font-black text-xs shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all font-outfit cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-white stroke-[2.5]" />
                    <span>{isEdit ? 'Save Changes' : 'Log Transaction'}</span>
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
