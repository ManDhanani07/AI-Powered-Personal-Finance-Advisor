import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';
import { formatCurrency } from '../../utils/formatters.js';

export const FeatureExploreModal = ({ feature, isOpen, onClose, onOpenLogin }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Interactive Demo States
  const [budgetSlider, setBudgetSlider] = useState(15000);
  const [goalContribution, setGoalContribution] = useState(150000);
  const [forecastGrowth, setForecastGrowth] = useState(10);
  const [selectedRegime, setSelectedRegime] = useState('new');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  if (!isOpen || !feature) return null;

  const Icon = feature.icon;

  const handleLaunchModule = () => {
    onClose();
    if (isAuthenticated && feature.route) {
      navigate(feature.route);
    } else if (onOpenLogin) {
      onOpenLogin();
    } else {
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-3xl rounded-3xl border border-border-strong bg-bg-surface p-6 sm:p-8 shadow-2xl relative overflow-hidden my-8"
          >
            {/* Background Glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-subtle pb-5 mb-6 relative z-10">
              <div className="flex items-center space-x-3.5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-extrabold text-white font-outfit">
                      {feature.title}
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      Live Interactive Module
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore functional capabilities, AI rules, and usage workflow
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Interactive Demo Container */}
            <div className="space-y-6 relative z-10">
              {/* Feature Description Box */}
              <div className="rounded-2xl border border-border-subtle bg-bg-elevated/60 p-4 text-xs text-slate-300 leading-relaxed">
                {feature.desc}
              </div>

              {/* ─── DYNAMIC INTERACTIVE DEMO CANVAS BY FEATURE TYPE ─── */}
              <div className="rounded-2xl border border-border-strong bg-slate-950 p-5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    Interactive Feature Simulation
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold">● Real-Time Demo</span>
                </div>

                {/* 1. EXPENSE TRACKING DEMO */}
                {feature.title === 'Expense Tracking' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Filter Ledger Feed:</span>
                      <div className="flex gap-1.5">
                        {['ALL', 'Shopping', 'Food & Dining', 'Salary'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              activeCategoryFilter === cat
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {[
                        { title: 'Buy Laptop', cat: 'Shopping', amt: -81500, merchant: 'Flipkart' },
                        { title: 'Monthly Salary', cat: 'Salary', amt: 150000, merchant: 'Company Corp' },
                        { title: 'Dinner', cat: 'Food & Dining', amt: -3200, merchant: 'Restaurant' },
                      ]
                        .filter((item) => activeCategoryFilter === 'ALL' || item.cat === activeCategoryFilter)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
                          >
                            <div>
                              <span className="font-bold text-white block">{item.title}</span>
                              <span className="text-[10px] text-slate-400">{item.merchant} • {item.cat}</span>
                            </div>
                            <span className={`font-extrabold ${item.amt > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {item.amt > 0 ? '+' : ''}{formatCurrency(item.amt)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. BUDGET PLANNING DEMO */}
                {feature.title === 'Budget Planning' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">Food & Dining Envelope Limit</span>
                        <span className="font-extrabold text-primary-400 font-mono">{formatCurrency(budgetSlider)}</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="50000"
                        step="1000"
                        value={budgetSlider}
                        onChange={(e) => setBudgetSlider(Number(e.target.value))}
                        className="w-full accent-primary-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Spent:</span>
                        <span className="font-bold text-white">{formatCurrency(3200)}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (3200 / budgetSlider) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Remaining Surplus:</span>
                        <span className="font-extrabold text-emerald-400 font-mono">
                          {formatCurrency(Math.max(0, budgetSlider - 3200))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SAVINGS GOALS DEMO */}
                {feature.title === 'Savings Goals' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">Emergency Wealth Vault</span>
                        <span className="text-[10px] text-slate-400">Target: {formatCurrency(200000)}</span>
                      </div>
                      <button
                        onClick={() => setGoalContribution((prev) => Math.min(200000, prev + 10000))}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        + Add ₹10,000
                      </button>
                    </div>

                    <div className="relative h-12 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center px-4">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/40 to-green-600/40 transition-all duration-500"
                        style={{ width: `${(goalContribution / 200000) * 100}%` }}
                      />
                      <div className="relative z-10 flex justify-between w-full text-xs font-mono font-extrabold">
                        <span className="text-emerald-400">{formatCurrency(goalContribution)} Saved</span>
                        <span className="text-white">{Math.round((goalContribution / 200000) * 100)}% Complete</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AI EXPENSE PREDICTION DEMO */}
                {(feature.title === 'AI Expense Prediction' || feature.title === 'AI Expense Prediction Engine' || feature.title === 'Executive Reports & Analytics') && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Simulated Income Growth Rate:</span>
                        <span className="font-extrabold text-emerald-400 font-mono">+{forecastGrowth}% Surplus</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={forecastGrowth}
                        onChange={(e) => setForecastGrowth(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Predicted Routine Spend (P50)</span>
                        <span className="font-extrabold text-white text-sm">
                          {formatCurrency(45000 * (1 - forecastGrowth / 200))}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Multi-Scale Model Accuracy</span>
                        <span className="font-extrabold text-emerald-400 text-sm">98.86% WPA (R²: 0.999)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. FINANCIAL HEALTH SCORE DEMO */}
                {feature.title === 'Financial Health Score' && (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
                      <span className="text-slate-400 text-[10px] uppercase block">Overall Health Grade</span>
                      <span className="text-2xl font-extrabold text-amber-400 font-outfit">85.9 / 100</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold inline-block">
                        Grade B+ (Excellent)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Savings Rate:</span>
                        <span className="text-emerald-400 font-bold">43.5% (High)</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Emergency Fund:</span>
                        <span className="text-emerald-400 font-bold">4.2 Months</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Vendor Risk:</span>
                        <span className="text-amber-400 font-bold">Optimal</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. REPORTS & TAX PLANNING DEMO */}
                {feature.title === 'Reports & Tax Planning' && (
                  <div className="space-y-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedRegime('new')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedRegime === 'new'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        New Tax Regime (Sec 115BAC)
                      </button>
                      <button
                        onClick={() => setSelectedRegime('old')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedRegime === 'old'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Old Tax Regime (With 80C/80D)
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">
                        Estimated Tax Liability under {selectedRegime === 'new' ? 'New Regime' : 'Old Regime'}
                      </span>
                      <span className="text-xl font-extrabold text-white font-mono">
                        {selectedRegime === 'new' ? formatCurrency(12500) : formatCurrency(19800)}
                      </span>
                      <p className="text-[11px] text-emerald-400 font-bold font-mono">
                        {selectedRegime === 'new' ? '✨ Save ₹7,300 with New Regime tax slabs!' : 'Requires ₹1.5L 80C ELSS investments'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow Capabilities Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit">
                  Key Module Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-bg-elevated/40 border border-border-subtle">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Live PostgreSQL Database Synchronization</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-bg-elevated/40 border border-border-subtle">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Automated Gemini AI Assistant Integration</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-bg-elevated/40 border border-border-subtle">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">1-Click Executive PDF & CSV Data Export</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-bg-elevated/40 border border-border-subtle">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Bank-Grade 256-Bit Encryption Security</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 text-center sm:text-left font-mono">
                  Full module accessible directly inside your dashboard account.
                </p>
                <button
                  onClick={handleLaunchModule}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary-500/25 transition-all cursor-pointer"
                >
                  <span>Launch {feature.title} Module</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeatureExploreModal;
