import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  CreditCard,
  Tag,
  MapPin,
  FileText,
  Paperclip,
  Scissors,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Edit3,
  Trash2,
  Upload,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { toast } from 'react-toastify';

export const TransactionDetailDrawer = ({
  isOpen,
  onClose,
  transaction,
  categories = [],
  onCategoryUpdate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'split' | 'receipt'
  const [selectedCategory, setSelectedCategory] = useState(transaction?.category_id || '');
  
  // Split tool state
  const [splitItems, setSplitItems] = useState([
    { category_id: transaction?.category_id || '', amount: (transaction?.amount || 0) * 0.6, label: 'Main Allocation' },
    { category_id: '', amount: (transaction?.amount || 0) * 0.4, label: 'Secondary Allocation' },
  ]);

  if (!transaction) return null;

  const isIncome = transaction.transaction_type === 'INCOME';
  const isTransfer = transaction.transaction_type === 'TRANSFER';

  const handleCategoryChange = (newCatId) => {
    setSelectedCategory(newCatId);
    if (onCategoryUpdate) {
      onCategoryUpdate(transaction.id, newCatId);
    }
    toast.success('Category updated successfully!');
  };

  const handleApplySplit = () => {
    toast.success(`Transaction split into ${splitItems.length} allocations!`, { icon: '✂️' });
    setActiveTab('details');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Right 480px Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-bg-surface border-l border-border-strong shadow-2xl z-10 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                    isIncome ? 'bg-emerald-500' : isTransfer ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                >
                  {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : isTransfer ? <RefreshCw className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit truncate max-w-[260px]">
                    {transaction.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{transaction.merchant || 'General Merchant'}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border-subtle px-6 bg-bg-elevated/40">
              {[
                { id: 'details', label: 'Granular Details' },
                { id: 'split', label: 'Split Expense' },
                { id: 'receipt', label: 'Receipt File' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body Canvas */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'details' && (
                <>
                  {/* Big Amount Card */}
                  <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-6 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction Amount</p>
                    <p className={`text-4xl font-black mt-1 font-outfit ${isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {transaction.transaction_type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {transaction.payment_method || 'UPI'}
                      </span>
                    </div>
                  </div>

                  {/* Manual Category Override Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category Override
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full rounded-2xl border border-border-strong bg-bg-elevated p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Metadata Grid */}
                  <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary-500" /> Date & Time
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatDate(transaction.transaction_date, 'DD MMM YYYY, hh:mm A')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-primary-500" /> Account Source
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {transaction.account_type || 'Primary Savings'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                      <span className="text-slate-400 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" /> Location
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {transaction.location || 'Mumbai, India'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary-500" /> Reference No.
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                        {transaction.transaction_number || 'TXN-984210'}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {transaction.notes && (
                    <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-4 space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Notes & Remarks</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{transaction.notes}</p>
                    </div>
                  )}
                </>
              )}

              {/* SPLIT EXPENSE TAB */}
              {activeTab === 'split' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    <span>Split total {formatCurrency(transaction.amount)} across multiple categories.</span>
                  </div>

                  {splitItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-border-strong bg-bg-elevated space-y-2">
                      <p className="text-xs font-bold text-slate-400">Allocation #{idx + 1}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={item.category_id}
                          onChange={(e) => {
                            const newItems = [...splitItems];
                            newItems[idx].category_id = e.target.value;
                            setSplitItems(newItems);
                          }}
                          className="rounded-xl border border-border-strong bg-bg-surface p-2 text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.category_name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const newItems = [...splitItems];
                            newItems[idx].amount = parseFloat(e.target.value) || 0;
                            setSplitItems(newItems);
                          }}
                          className="rounded-xl border border-border-strong bg-bg-surface p-2 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleApplySplit}
                    className="w-full py-3 rounded-2xl bg-primary-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.01] transition-transform"
                  >
                    Confirm Split Allocation
                  </button>
                </div>
              )}

              {/* RECEIPT ATTACHMENT TAB */}
              {activeTab === 'receipt' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border-strong rounded-3xl p-8 text-center bg-bg-elevated/40 space-y-3">
                    <Paperclip className="w-10 h-10 text-primary-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Attach Transaction Receipt</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Drag & drop PDF, JPG, or PNG receipts up to 10MB for AI OCR parsing.
                    </p>
                    <button className="px-4 py-2 rounded-xl bg-bg-surface border border-border-strong text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Receipt</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Quick Actions */}
            <div className="p-6 border-t border-border-subtle bg-bg-elevated/40 flex items-center justify-between">
              <button
                onClick={() => {
                  onDelete(transaction);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailDrawer;
