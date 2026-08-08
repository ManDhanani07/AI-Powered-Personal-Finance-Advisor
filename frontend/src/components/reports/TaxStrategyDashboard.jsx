import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  IndianRupee,
  Building,
  Lock,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { toast } from 'react-toastify';

import dashboardService from '../../services/dashboardService.js';

export const TaxStrategyDashboard = () => {
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [section80C, setSection80C] = useState(0);
  const [section80D, setSection80D] = useState(0);
  const [nps80CCD, setNps80CCD] = useState(0);

  React.useEffect(() => {
    let isMounted = true;
    const fetchUserIncome = async () => {
      try {
        const res = await dashboardService.getCompleteDashboard(10);
        const payload = res?.data?.data ?? res?.data;
        const monthlyInc = Number(payload?.overview?.total_income ?? 0);
        if (isMounted && monthlyInc > 0) {
          setTaxableIncome(monthlyInc * 12);
        }
      } catch (err) {
        console.warn('Failed to load user income for tax calculator:', err);
      }
    };
    fetchUserIncome();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculations for Old Regime
  const hasIncome = taxableIncome > 0;
  const old80CGap = hasIncome ? Math.max(0, 150000 - section80C) : 0;
  const old80DGap = hasIncome ? Math.max(0, 25000 - section80D) : 0;
  const oldNpsGap = hasIncome ? Math.max(0, 50000 - nps80CCD) : 0;

  const stdDeductionOld = hasIncome ? 50000 : 0;
  const stdDeductionNew = hasIncome ? 75000 : 0;

  const oldTotalDeductions = Math.min(150000, section80C) + Math.min(25000, section80D) + Math.min(50000, nps80CCD) + stdDeductionOld;
  const oldNetTaxable = Math.max(0, taxableIncome - oldTotalDeductions);

  // Simplified Indian Tax Slabs AY 2026-27
  // Old Regime Tax Calculation
  let oldTax = 0;
  if (oldNetTaxable > 1000000) {
    oldTax = 112500 + (oldNetTaxable - 1000000) * 0.3;
  } else if (oldNetTaxable > 500000) {
    oldTax = 12500 + (oldNetTaxable - 500000) * 0.2;
  } else if (oldNetTaxable > 250000) {
    oldTax = (oldNetTaxable - 250000) * 0.05;
  }
  const oldTotalTax = Math.round(oldTax * 1.04); // Health & Ed Cess 4%

  // New Regime (Section 115BAC) AY 2026-27 (Standard Deduction 75,000)
  const newNetTaxable = Math.max(0, taxableIncome - stdDeductionNew);
  let newTax = 0;
  if (newNetTaxable > 1500000) {
    newTax = 150000 + (newNetTaxable - 1500000) * 0.3;
  } else if (newNetTaxable > 1200000) {
    newTax = 90000 + (newNetTaxable - 1200000) * 0.2;
  } else if (newNetTaxable > 900000) {
    newTax = 45000 + (newNetTaxable - 900000) * 0.15;
  } else if (newNetTaxable > 600000) {
    newTax = 15000 + (newNetTaxable - 600000) * 0.1;
  } else if (newNetTaxable > 300000) {
    newTax = (newNetTaxable - 300000) * 0.05;
  }
  const newTotalTax = Math.round(newTax * 1.04);

  const isNewBetter = newTotalTax <= oldTotalTax;
  const taxSavingsDifference = Math.abs(oldTotalTax - newTotalTax);

  const handleInvestCTA = (type, amount) => {
    toast.success(`Redirecting to ELSS/PPF investment portal for ${formatCurrency(amount)} allocation!`, { icon: '📈' });
  };

  return (
    <div className="space-y-6">
      {/* Tax Income Input Header */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                Income Tax Optimization Engine (AY 2026-27)
              </h3>
              <p className="text-xs text-slate-400">
                Compare Section 115BAC New Regime vs Old Regime and maximize 80C/80D tax deductions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-400">Gross Annual Salary:</span>
            <input
              type="number"
              step={50000}
              value={taxableIncome}
              onChange={(e) => setTaxableIncome(parseFloat(e.target.value) || 0)}
              className="w-40 rounded-2xl border border-border-strong bg-bg-elevated p-2.5 font-mono text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            isNewBetter
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-primary-500/30 bg-primary-500/10 text-primary-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span>
              AI Recommendation: <strong className="font-bold">{isNewBetter ? 'New Tax Regime (Section 115BAC)' : 'Old Tax Regime'}</strong> is optimal for your profile, saving you <strong className="underline">{formatCurrency(taxSavingsDifference)}</strong> in taxes.
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table: Old vs New Regime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old Tax Regime Card */}
        <div className={`rounded-3xl border p-6 space-y-4 bg-bg-surface shadow-glass relative ${
          !isNewBetter ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-border-subtle'
        }`}>
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                Old Tax Regime
              </h4>
              <p className="text-[11px] text-slate-400">With 80C, 80D, HRA & NPS Deductions</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase">
              Deductions
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross Income:</span>
              <span className="font-bold text-slate-200">{formatCurrency(taxableIncome)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Claimed Deductions:</span>
              <span className="font-bold text-emerald-400">{oldTotalDeductions > 0 ? `-${formatCurrency(oldTotalDeductions)}` : '₹0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-border-subtle pt-2">
              <span>Net Taxable Income:</span>
              <span className="font-bold text-slate-200">{formatCurrency(oldNetTaxable)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-border-subtle">
              <span className="text-slate-300">Total Tax Liability (Inc. Cess):</span>
              <span className="text-rose-500 font-mono">{formatCurrency(oldTotalTax)}</span>
            </div>
          </div>
        </div>

        {/* New Tax Regime Card (Section 115BAC) */}
        <div className={`rounded-3xl border p-6 space-y-4 bg-bg-surface shadow-glass relative ${
          isNewBetter ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-border-subtle'
        }`}>
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                New Tax Regime (Sec 115BAC)
              </h4>
              <p className="text-[11px] text-slate-400">Concessional Slabs + ₹75,000 Standard Deduction</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold uppercase">
              Recommended
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross Income:</span>
              <span className="font-bold text-slate-200">{formatCurrency(taxableIncome)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Standard Deduction:</span>
              <span className="font-bold text-emerald-400">{stdDeductionNew > 0 ? '-₹75,000' : '₹0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-border-subtle pt-2">
              <span>Net Taxable Income:</span>
              <span className="font-bold text-slate-200">{formatCurrency(newNetTaxable)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-border-subtle">
              <span className="text-slate-300">Total Tax Liability (Inc. Cess):</span>
              <span className="text-emerald-500 font-mono">{formatCurrency(newTotalTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deductions Gap Visual Indicator Cards */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-6">
        <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
          Section 80C & 80D Tax Deduction Gap Analysis
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 80C Gap */}
          <div className="rounded-2xl border border-border-strong bg-bg-elevated/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Section 80C (ELSS, PPF, EPF)</span>
              <span className="text-xs font-mono font-bold text-primary-400">₹1.50 Lakh Limit</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white font-outfit">
              {formatCurrency(section80C)} <span className="text-xs text-slate-400 font-normal">claimed</span>
            </p>

            <div className="h-2 rounded-full bg-border-strong overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (section80C / 150000) * 100)}%` }}
              />
            </div>

            {old80CGap > 0 ? (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-amber-400 font-semibold">
                  Remaining Gap: <strong>{formatCurrency(old80CGap)}</strong>
                </p>
                <button
                  onClick={() => handleInvestCTA('ELSS', old80CGap)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
                >
                  <span>Invest in ELSS Funds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 100% 80C Limit Maximized!
              </p>
            )}
          </div>

          {/* Section 80D Gap */}
          <div className="rounded-2xl border border-border-strong bg-bg-elevated/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Section 80D (Health Insurance)</span>
              <span className="text-xs font-mono font-bold text-primary-400">₹25,000 Limit</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white font-outfit">
              {formatCurrency(section80D)} <span className="text-xs text-slate-400 font-normal">claimed</span>
            </p>

            <div className="h-2 rounded-full bg-border-strong overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (section80D / 25000) * 100)}%` }}
              />
            </div>

            {old80DGap > 0 ? (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-amber-400 font-semibold">
                  Remaining Gap: <strong>{formatCurrency(old80DGap)}</strong>
                </p>
                <button
                  onClick={() => handleInvestCTA('HEALTH', old80DGap)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
                >
                  <span>Add Health Cover</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 100% 80D Limit Maximized!
              </p>
            )}
          </div>

          {/* Capital Gains (LTCG / STCG) Summary */}
          <div className="rounded-2xl border border-border-strong bg-bg-elevated/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Capital Gains (AY 2026-27)</span>
              <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                Equity
              </span>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">LTCG (&gt;12M):</span>
                <span className="font-bold text-slate-200">12.5% (Above ₹1.25L Exemption)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">STCG (&lt;12M):</span>
                <span className="font-bold text-slate-200">20% Fixed Flat Rate</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-bg-surface border border-border-subtle text-[11px] text-slate-400 font-medium">
              Harvest up to ₹1,25,000 in LTCG gains tax-free before March 31st.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxStrategyDashboard;
