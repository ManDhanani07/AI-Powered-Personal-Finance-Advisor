import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Download,
  Sparkles,
  Check,
  HelpCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { toast } from 'react-toastify';

import transactionService from '../../services/transactionService.js';
import { formatCurrency } from '../../utils/formatters.js';

// Category color resolver matching main table
const CATEGORY_COLOR_MAP = {
  'food': '#F43F5E',
  'food & dining': '#F43F5E',
  'dining': '#F43F5E',
  'shopping': '#A855F7',
  'savings': '#10B981',
  'investment': '#10B981',
  'investments': '#10B981',
  'transport': '#3B82F6',
  'transportation': '#3B82F6',
  'travel': '#3B82F6',
  'utilities': '#06B6D4',
  'bills': '#06B6D4',
  'entertainment': '#EC4899',
  'healthcare': '#F59E0B',
  'salary': '#10B981',
  'income': '#10B981',
  'freelancing': '#10B981',
  'business': '#10B981',
};

const getCategoryColor = (name, dbColor) => {
  if (dbColor && dbColor !== '#94A3B8' && dbColor !== '#64748b') return dbColor;
  if (!name) return '#94a3b8';
  const key = name.toLowerCase().trim();
  return CATEGORY_COLOR_MAP[key] || dbColor || '#94a3b8';
};

const TxAvatar = ({ title, merchant, type }) => {
  const isIncome = type === 'INCOME';
  const isTransfer = type === 'TRANSFER';
  const letter = (merchant || title || '?').charAt(0).toUpperCase();

  let ring = 'border-zinc-700';
  let bg = 'bg-zinc-800';
  let text = 'text-slate-300';
  if (isIncome) { ring = 'border-emerald-500/30'; bg = 'bg-emerald-500/10'; text = 'text-emerald-400'; }
  if (isTransfer) { ring = 'border-indigo-500/30'; bg = 'bg-indigo-500/10'; text = 'text-indigo-400'; }

  return (
    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${ring} ${bg} ${text}`}>
      {letter}
    </div>
  );
};

export const CsvImportModal = ({ isOpen, onClose, onImportSuccess, categories = [] }) => {
  const fileInputRef = useRef(null);

  // Steps: 1 = Upload, 2 = Mapping, 3 = Preview, 4 = Success
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Defaults
  const [defaultAccount, setDefaultAccount] = useState('SAVINGS');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('UPI');

  // Preview Data from Backend
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});

  // Preview Filter State
  const [previewTab, setPreviewTab] = useState('ALL'); // ALL, VALID, REVIEW, DUPLICATE
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Import Execution State
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const resetAll = () => {
    setStep(1);
    setFile(null);
    setPreviewData(null);
    setColumnMapping({});
    setPreviewTab('ALL');
    setImportResult(null);
    setIsImporting(false);
    setIsLoadingPreview(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt'))) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a valid .csv file');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  // Step 1 -> Step 2: Upload file & initial parse
  const handleProceedToMapping = async () => {
    if (!file) {
      toast.warn('Please select or drop a CSV file first.');
      return;
    }

    setIsLoadingPreview(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('default_account_type', defaultAccount);
      formData.append('default_payment_method', defaultPaymentMethod);

      const res = await transactionService.previewCsvImport(formData);
      if (res?.data) {
        setPreviewData(res.data);
        setColumnMapping(res.data.summary?.column_mapping || {});
        setStep(2);
      } else {
        toast.error(res?.message || 'Failed to parse CSV file.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to parse CSV file.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Step 2 -> Step 3: Re-parse with custom column mapping overrides if any
  const handleProceedToPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('default_account_type', defaultAccount);
      formData.append('default_payment_method', defaultPaymentMethod);
      formData.append('column_mapping', JSON.stringify(columnMapping));

      const res = await transactionService.previewCsvImport(formData);
      if (res?.data) {
        setPreviewData(res.data);
        setStep(3);
      } else {
        toast.error(res?.message || 'Failed to generate preview.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Step 3 -> Step 4: Execute batch import
  const handleConfirmImport = async () => {
    if (!previewData?.preview_rows?.length) return;

    const rowsToImport = previewData.preview_rows.filter((r) => {
      if (!r.is_valid) return false;
      if (skipDuplicates && r.is_duplicate) return false;
      return true;
    });

    if (!rowsToImport.length) {
      toast.warn('No valid transactions to import.');
      return;
    }

    setIsImporting(true);
    try {
      const payload = {
        transactions: rowsToImport.map((r) => ({
          date: r.date,
          title: r.title,
          merchant: r.merchant,
          description: r.description,
          amount: r.amount,
          transaction_type: r.transaction_type,
          category_id: r.category_id,
          category_name: r.category_name,
          account_type: r.account_type || defaultAccount,
          payment_method: r.payment_method || defaultPaymentMethod,
          status: r.status || 'COMPLETED',
        })),
        skip_duplicates: skipDuplicates,
        default_account_type: defaultAccount,
        default_payment_method: defaultPaymentMethod,
        filename: selectedFile?.name || 'transactions.csv',
      };

      const res = await transactionService.confirmCsvImport(payload);
      if (res?.data) {
        setImportResult(res.data);
        setStep(4);
        toast.success(res.message || 'Transactions imported successfully!');
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        toast.error(res?.message || 'Failed to import transactions.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to import transactions.');
    } finally {
      setIsImporting(false);
    }
  };

  // Filter preview rows by tab
  const getFilteredRows = () => {
    if (!previewData?.preview_rows) return [];
    if (previewTab === 'VALID') return previewData.preview_rows.filter((r) => r.is_valid && !r.is_duplicate);
    if (previewTab === 'REVIEW') return previewData.preview_rows.filter((r) => r.needs_review && !r.is_duplicate);
    if (previewTab === 'DUPLICATE') return previewData.preview_rows.filter((r) => r.is_duplicate);
    return previewData.preview_rows;
  };

  const summary = previewData?.summary || {};
  const filteredRows = getFilteredRows();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-outfit">Import Transactions from CSV</h2>
              <p className="text-xs text-slate-400">
                {step === 1 && 'Step 1: Upload CSV file & select defaults'}
                {step === 2 && 'Step 2: Review and verify column mapping'}
                {step === 3 && 'Step 3: Preview normalized transactions & validate'}
                {step === 4 && 'Step 4: Import Summary & Confirmation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicator Badges */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-slate-400">
              <span className={step >= 1 ? 'text-emerald-400' : ''}>Upload</span>
              <span>→</span>
              <span className={step >= 2 ? 'text-emerald-400' : ''}>Map</span>
              <span>→</span>
              <span className={step >= 3 ? 'text-emerald-400' : ''}>Preview</span>
              <span>→</span>
              <span className={step >= 4 ? 'text-emerald-400' : ''}>Done</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── STEP 1: UPLOAD FILE & DEFAULTS ── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : file
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                  <UploadCloud className="w-6 h-6" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                      <span>{file.name}</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • Click or drag to change file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      Click to upload or drag & drop your statement CSV file
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports HDFC, SBI, ICICI, Axis, Zerodha, and generic CSV formats (up to 5,000 rows)
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Template Download */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-300">Need a sample template format?</span>
                </div>
                <button
                  type="button"
                  onClick={() => transactionService.downloadSampleCsv()}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Download Sample CSV
                </button>
              </div>

              {/* Default Account & Payment Method Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Default Account (if missing in CSV)
                  </label>
                  <select
                    value={defaultAccount}
                    onChange={(e) => setDefaultAccount(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CHECKING">Checking / Current Account</option>
                    <option value="CREDIT">Credit Card Account</option>
                    <option value="INVESTMENT">Investment / Demat</option>
                    <option value="WALLET">Digital Wallet / Cash</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Default Payment Method (if missing in CSV)
                  </label>
                  <select
                    value={defaultPaymentMethod}
                    onChange={(e) => setDefaultPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="NET_BANKING">Net Banking / NEFT</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: COLUMN MAPPING ── */}
          {step === 2 && previewData && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Detected <strong>{previewData.summary?.detected_headers?.length || 0} columns</strong> in your CSV file. Review and adjust field mapping below:
                  </span>
                </div>
              </div>

              {/* Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {[
                  { key: 'date', label: 'Date', required: true, desc: 'Transaction date (DD/MM/YYYY, YYYY-MM-DD, etc.)' },
                  { key: 'merchant', label: 'Merchant / Payee', required: false, desc: 'Merchant name (Swiggy, Amazon, Uber, etc.)' },
                  { key: 'description', label: 'Description / Narration', required: false, desc: 'Transaction description or details' },
                  { key: 'amount', label: 'Amount', required: false, desc: 'Single amount column (+/- or with Type column)' },
                  { key: 'debit', label: 'Debit / Withdrawal', required: false, desc: 'Separate debit amount column' },
                  { key: 'credit', label: 'Credit / Deposit', required: false, desc: 'Separate credit amount column' },
                  { key: 'transaction_type', label: 'Transaction Type', required: false, desc: 'Type column (Debit/Credit, Expense/Income)' },
                  { key: 'category', label: 'Category', required: false, desc: 'Category name (Food, Shopping, Salary, etc.)' },
                  { key: 'payment_method', label: 'Payment Method', required: false, desc: 'Payment mode (UPI, Credit Card, Cash, etc.)' },
                  { key: 'account', label: 'Account', required: false, desc: 'Source account name' },
                  { key: 'status', label: 'Status', required: false, desc: 'Status (Completed, Pending, etc.)' },
                ].map(({ key, label, required, desc }) => (
                  <div key={key} className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {label}
                        {required && <span className="text-rose-400 text-[10px]">*Required</span>}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {columnMapping[key] ? '✓ Mapped' : 'Not mapped'}
                      </span>
                    </div>

                    <select
                      value={columnMapping[key] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [key]: e.target.value || null })}
                      className={`w-full rounded-lg border py-1.5 px-2.5 text-xs focus:outline-none transition-colors ${
                        columnMapping[key]
                          ? 'border-emerald-500/40 bg-zinc-900 text-white focus:border-emerald-500'
                          : 'border-zinc-800 bg-zinc-950 text-slate-400 focus:border-zinc-700'
                      }`}
                    >
                      <option value="">— Select CSV Column —</option>
                      {previewData.summary?.detected_headers?.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>

                    <p className="text-[10px] text-slate-500 truncate">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: PREVIEW & VALIDATION ── */}
          {step === 3 && previewData && (
            <div className="space-y-4">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Rows</p>
                  <p className="text-lg font-black text-white mt-0.5">{summary.total_rows || 0}</p>
                </div>

                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Valid Rows</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">{summary.valid_rows || 0}</p>
                </div>

                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Needs Review</p>
                  <p className="text-lg font-black text-amber-400 mt-0.5">{summary.review_rows || 0}</p>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Duplicates</p>
                  <p className="text-lg font-black text-rose-400 mt-0.5">{summary.duplicate_rows || 0}</p>
                </div>
              </div>

              {/* Tabs & Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
                  <button
                    onClick={() => setPreviewTab('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      previewTab === 'ALL' ? 'bg-zinc-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({summary.total_rows || 0})
                  </button>
                  <button
                    onClick={() => setPreviewTab('VALID')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      previewTab === 'VALID' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Valid Only ({summary.valid_rows || 0})
                  </button>
                  <button
                    onClick={() => setPreviewTab('REVIEW')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      previewTab === 'REVIEW' ? 'bg-amber-500/20 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Review ({summary.review_rows || 0})
                  </button>
                  <button
                    onClick={() => setPreviewTab('DUPLICATE')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      previewTab === 'DUPLICATE' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Duplicates ({summary.duplicate_rows || 0})
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Skip Duplicate Transactions</span>
                </label>
              </div>

              {/* Preview Table - matching exact layout of TransactionTable.jsx */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden overflow-x-auto max-h-[40vh] [scrollbar-width:none]">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-3">Transaction</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Account & Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-xs">
                    {filteredRows.map((r, i) => {
                      const isIncome = r.transaction_type === 'INCOME';
                      return (
                        <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <TxAvatar title={r.title} merchant={r.merchant} type={r.transaction_type} />
                              <div className="min-w-0">
                                <p className="font-semibold text-white truncate max-w-[160px]">{r.title}</p>
                                {r.merchant && r.merchant !== r.title && (
                                  <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{r.merchant}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-2 px-3">
                            <span
                              className="font-medium truncate block max-w-[120px]"
                              style={{ color: getCategoryColor(r.category_name, r.category_color) }}
                            >
                              {r.category_name || 'Uncategorized'}
                            </span>
                          </td>

                          <td className="py-2 px-3 whitespace-nowrap text-slate-400">{r.date}</td>

                          <td className="py-2 px-3">
                            <p className="font-medium text-slate-300">{r.account_type}</p>
                            <p className="text-[10px] text-slate-500">{r.payment_method}</p>
                          </td>

                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {r.status || 'Completed'}
                            </span>
                          </td>

                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {isIncome ? (
                                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3 text-rose-400" />
                              )}
                              <span className={`font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-300'}`}>
                                {isIncome ? '+' : '−'}{formatCurrency(r.amount)}
                              </span>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {r.is_duplicate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Duplicate
                              </span>
                            ) : !r.is_valid ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                title={r.validation_errors?.join(', ')}
                              >
                                Error
                              </span>
                            ) : r.needs_review ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                title={r.review_reasons?.join(', ')}
                              >
                                Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STEP 4: SUCCESS SUMMARY ── */}
          {step === 4 && importResult && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white font-outfit">Import Completed Successfully!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  {importResult.message || `${importResult.imported_count} transactions have been added to your ledger.`}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Imported</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">{importResult.imported_count || 0}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duplicates Skipped</p>
                  <p className="text-lg font-black text-slate-400 mt-0.5">{importResult.skipped_duplicates || 0}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Processed</p>
                  <p className="text-lg font-black text-white mt-0.5">{importResult.total_requested || 0}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToMapping}
                disabled={!file || isLoadingPreview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing File...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Column Mapping</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToPreview}
                disabled={isLoadingPreview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Generating Preview...</span>
                  </>
                ) : (
                  <>
                    <span>Preview & Validate Rows</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Mapping</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || summary.valid_rows === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Importing to Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Import {skipDuplicates ? (summary.valid_rows || 0) - (summary.duplicate_rows || 0) : summary.valid_rows || 0} Transactions
                    </span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 4 && (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>View Transactions in Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CsvImportModal;
