import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Cpu,
} from 'lucide-react';
import { toast } from 'react-toastify';

export const CategoryRuleBuilder = ({ selectedCategory, categories = [] }) => {
  const [field, setField] = useState('merchant');
  const [operator, setOperator] = useState('contains');
  const [valueText, setValueText] = useState('Uber|Ola|Rapido');
  const [targetCategory, setTargetCategory] = useState(selectedCategory?.id || '');

  // Simulation test results state
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestRule = () => {
    setIsTesting(true);
    setTimeout(() => {
      // Simulated matching result
      const matchCount = Math.floor(Math.random() * 18) + 4;
      setTestResult({
        count: matchCount,
        sampleMatches: [
          { merchant: 'Uber India Rides', amount: '₹340.00', date: '01 Aug 2026' },
          { merchant: 'Ola Cabs Auto', amount: '₹180.00', date: '28 Jul 2026' },
          { merchant: 'Rapido Bike Taxi', amount: '₹95.00', date: '24 Jul 2026' },
        ],
      });
      setIsTesting(false);
      toast.success(`Rule validation complete: ${matchCount} historical transactions match!`, { icon: '🔍' });
    }, 600);
  };

  const handleSaveRule = () => {
    toast.success(`Automated Categorization Rule saved for ${selectedCategory?.category_name || 'Category'}!`, { icon: '⚙️' });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-accent-500/10 text-accent-500">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
              Automated Regex & Keyword Rule Engine
            </h4>
            <p className="text-[11px] text-slate-400">
              Transactions matching this condition will be automatically categorized into{' '}
              <span className="font-bold text-primary-500">{selectedCategory?.category_name || 'Selected Category'}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Logic Builder Row */}
      <div className="p-4 rounded-2xl border border-border-strong bg-bg-elevated/60 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400">IF</span>
          <span>Condition Rule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Target Field Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Field</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-bg-surface p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="merchant">Merchant Name</option>
              <option value="description">Transaction Description</option>
              <option value="amount">Amount Greater Than</option>
              <option value="payment_method">Payment Method</option>
            </select>
          </div>

          {/* Operator Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Operator</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-bg-surface p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="contains">Contains Keyword</option>
              <option value="matches_regex">Matches Regex Pattern</option>
              <option value="equals">Exact Equals</option>
              <option value="starts_with">Starts With</option>
            </select>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Matching Pattern / Keyword</label>
            <input
              type="text"
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder="e.g. Swiggy|Zomato"
              className="w-full rounded-xl border border-border-strong bg-bg-surface p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Action THEN */}
        <div className="flex items-center space-x-2 pt-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">THEN</span>
          <span className="text-slate-400">Automatically assign category to</span>
          <span className="font-bold text-slate-900 dark:text-white px-2.5 py-1 rounded-xl bg-bg-surface border border-border-subtle">
            {selectedCategory?.category_name || 'Category'}
          </span>
        </div>
      </div>

      {/* Buttons & Live Test Results */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={handleTestRule}
          disabled={isTesting}
          className="px-4 py-2.5 rounded-2xl border border-border-strong bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center space-x-1.5"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>{isTesting ? 'Testing Historical Ledger...' : 'Test Rule'}</span>
        </button>

        <button
          onClick={handleSaveRule}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center space-x-1.5 ml-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Automation Rule</span>
        </button>
      </div>

      {/* Test Result Simulation Box */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulation Complete</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-xs">
                {testResult.count} transactions match this rule
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Sample Matching Ledger Items:</p>
              {testResult.sampleMatches.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-bg-surface/80">
                  <span className="font-bold text-slate-900 dark:text-white">{m.merchant}</span>
                  <span className="text-slate-400">{m.date}</span>
                  <span className="font-mono font-bold text-emerald-500">{m.amount}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryRuleBuilder;
