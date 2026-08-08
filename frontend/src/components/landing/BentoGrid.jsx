import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Calculator,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const BentoGrid = () => {
  // Quadrant 2: Multi-Currency Toggle State
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const exchangeRate = 0.012; // 1 INR = 0.012 USD

  const netWorthINR = 2485000;
  const netWorthUSD = netWorthINR * exchangeRate;

  // Quadrant 3: Tax Simulator State
  const [income, setIncome] = useState(1500000); // ₹15,00,000 annual
  const [regime, setRegime] = useState('NEW'); // 'NEW' | 'OLD'

  // Approximate tax calculations for demo
  const oldTax = Math.max(0, (income - 150000 - 50000) * 0.2);
  const newTax = Math.max(0, (income - 75000) * 0.15);
  const taxSavings = Math.abs(oldTax - newTax);

  return (
    <section id="bento" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/25 text-accent-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>AI-Driven Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
            Engineered for Precision Wealth Optimization
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Four core AI modules working in sync to categorize transactions, optimize tax liability, and safeguard your net worth.
          </p>
        </div>

        {/* 4-Quadrant Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Quadrant 1: Auto Categorization Engine */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-border-strong bg-bg-surface p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary-500/10 blur-2xl group-hover:bg-primary-500/20 transition-all" />

            <div>
              <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500 w-fit mb-5">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
                Auto Categorization Engine
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Instant merchant pattern recognition with 99.8% AI accuracy. Automatically tags expenses from SMS, UPI, and bank feeds.
              </p>
            </div>

            {/* Live Ledger Interactive Preview */}
            <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-elevated p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Recent Stream</span>
                <span className="text-emerald-500 font-extrabold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> 99.8% Match Rate
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-surface text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Starbucks Coffee</p>
                    <p className="text-[10px] text-slate-400">Merchant Recognized: Starbucks Corp</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold text-[10px]">
                    Food & Dining
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-surface text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Uber Premier Trip</p>
                    <p className="text-[10px] text-slate-400">Merchant Recognized: Uber B.V.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                    Travel
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quadrant 2: Real-time Net Worth Aggregator */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-border-strong bg-bg-surface p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                {/* Multi-Currency Dynamic Toggle */}
                <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currency === 'INR'
                        ? 'bg-primary-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    INR (₹)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currency === 'USD'
                        ? 'bg-primary-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
                Real-time Net Worth Aggregator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Unified view across bank accounts, mutual funds, stocks, and real estate with instant multi-currency conversion.
              </p>
            </div>

            {/* Dynamic Net Worth Preview */}
            <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-elevated p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aggregated Assets Value</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {currency === 'INR' ? `₹${netWorthINR.toLocaleString('en-IN')}` : `$${netWorthUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-[11px]">
                <div className="p-2 rounded-xl bg-bg-surface text-center">
                  <p className="text-slate-400 font-medium">Bank Deposits</p>
                  <p className="font-bold text-emerald-500 mt-0.5">{currency === 'INR' ? '₹6.5L' : '$7.8k'}</p>
                </div>
                <div className="p-2 rounded-xl bg-bg-surface text-center">
                  <p className="text-slate-400 font-medium">Equities</p>
                  <p className="font-bold text-indigo-400 mt-0.5">{currency === 'INR' ? '₹14.2L' : '$17.0k'}</p>
                </div>
                <div className="p-2 rounded-xl bg-bg-surface text-center">
                  <p className="text-slate-400 font-medium">Gold / Debt</p>
                  <p className="font-bold text-amber-500 mt-0.5">{currency === 'INR' ? '₹4.15L' : '$4.9k'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quadrant 3: Tax Strategy Simulator */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-border-strong bg-bg-surface p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />

            <div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-5">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
                Tax Strategy Simulator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Simulate Section 80C deductions, HRA claims, and Compare Old vs. New Tax Regime to maximize your annual savings.
              </p>
            </div>

            {/* Interactive Tax Simulator Preview */}
            <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-elevated p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">Select Regime Strategy</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setRegime('NEW')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                      regime === 'NEW' ? 'bg-amber-500 text-white' : 'bg-bg-surface text-slate-400'
                    }`}
                  >
                    New Regime
                  </button>
                  <button
                    onClick={() => setRegime('OLD')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                      regime === 'OLD' ? 'bg-amber-500 text-white' : 'bg-bg-surface text-slate-400'
                    }`}
                  >
                    Old (80C + 80D)
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-bg-surface flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated Tax Liability</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    ₹{Math.round(regime === 'NEW' ? newTax : oldTax).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px]">
                  Save up to ₹78,000/yr
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quadrant 4: AI Risk & Overspending Detector */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-border-strong bg-bg-surface p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl group-hover:bg-rose-500/20 transition-all" />

            <div>
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 w-fit mb-5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
                AI Risk & Overspending Detector
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Automated anomaly detection alerts you before recurring subscriptions or impulse purchases derail your financial goals.
              </p>
            </div>

            {/* Risk Card Alert */}
            <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-500">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>Anomaly Alert Triggered</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                Dining out expenses are 42% higher than your 3-month average.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI Recommendation: Reallocate ₹4,500 from Entertainment budget to stay on track for Goal: Emergency Fund.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
