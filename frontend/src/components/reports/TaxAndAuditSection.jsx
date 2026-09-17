import React, { useState } from 'react';
import {
  ShieldCheck,
  Percent,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Repeat,
  Sparkles,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const TaxAndAuditSection = ({ advancedData, summaryData }) => {
  const taxData = advancedData?.tax_audit || {
    total_eligible_deductions: 0,
    total_claimed_deductions: 0,
    estimated_tax_shield_20pct: 0,
    estimated_tax_shield_30pct: 0,
    breakdown: {},
  };

  const recurringData = advancedData?.recurring_audit || {
    active_subscriptions_count: 0,
    total_monthly_recurring: 0,
    total_annual_projected: 0,
    recurring_services: [],
  };

  const anomalyData = advancedData?.anomaly_audit || {
    detected_anomalies_count: 0,
    outlier_transactions: [],
  };

  const taxCategories = Object.values(taxData.breakdown || {});

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Tax Shield & Fiscal Optimization Hub */}
      <div className="bg-gradient-to-r from-zinc-950 via-emerald-950/30 to-zinc-950 border border-emerald-500/30 p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 -right-28 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5 font-mono">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Fiscal Year Tax Deductible Intelligence
            </span>
            <h3 className="text-xl font-black text-white tracking-tight font-outfit">
              Tax-Advantaged Deductions & Potential Tax Shield
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated audit classifying your transactions into eligible tax-deductible categories (Section 80C, 80D, 80G, and professional business write-offs) to maximize fiscal year tax savings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[320px]">
            <div className="bg-black/60 border border-emerald-500/25 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Claimable Deductions
              </span>
              <p className="text-2xl font-black font-mono text-emerald-400">
                {formatCurrency(taxData.total_claimed_deductions)}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                From {formatCurrency(taxData.total_eligible_deductions)} total eligible expenses
              </p>
            </div>

            <div className="bg-black/60 border border-emerald-500/25 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estimated Tax Shield (Savings)
              </span>
              <p className="text-2xl font-black font-mono text-cyan-300">
                {formatCurrency(taxData.estimated_tax_shield_30pct)}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                At 30% slab ({formatCurrency(taxData.estimated_tax_shield_20pct)} at 20% slab)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tax Deductibles Breakdown by Section */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Deductions Allocation by Statutory Section</span>
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of eligible expenditures vs statutory regulatory ceilings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taxCategories.map((item, idx) => {
            const pct = Math.min(100, item.utilization_pct || 0);
            return (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-outfit flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {item.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {pct}% Claimed
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-white">
                    {formatCurrency(item.claimed_amount)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Cap: {formatCurrency(item.max_limit)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{item.items_count} qualifying transactions</span>
                  <span>Eligible: {formatCurrency(item.eligible_amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recurring Commitments & Subscription Audit */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <Repeat className="w-5 h-5 text-indigo-400" />
              <span>Recurring Subscriptions & Fixed Overhead Audit</span>
            </h3>
            <p className="text-xs text-slate-400">
              Identified monthly recurring transactions, telecom contracts, digital memberships, and reserve transfers.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Recurring Burn</span>
              <span className="text-base font-black font-mono text-indigo-300">{formatCurrency(recurringData.total_monthly_recurring)}</span>
            </div>
            <div className="text-right pl-3 border-l border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Commitment</span>
              <span className="text-base font-black font-mono text-white">{formatCurrency(recurringData.total_annual_projected)}</span>
            </div>
          </div>
        </div>

        {recurringData.recurring_services.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            No recurring subscription or overhead transactions detected in this cycle.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recurringData.recurring_services.map((sub, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate font-outfit">{sub.name}</h4>
                  <p className="text-[10px] text-slate-400">{sub.category} • {sub.frequency}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black font-mono text-indigo-300 block">{formatCurrency(sub.amount)}</span>
                  <span className="text-[9px] font-mono text-slate-400">{formatCurrency(sub.annual_projected)}/yr</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Spending Anomaly & Outlier Audit */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Statistical Spending Anomaly Detection</span>
            </h3>
            <p className="text-xs text-slate-400">
              Transactions flagged as statistical outliers exceeding 200% of category historical average.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {anomalyData.detected_anomalies_count} Outliers Flagged
          </span>
        </div>

        {anomalyData.outlier_transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            No unusual spending spikes or anomalous transactions detected. All transactions fall within standard distribution.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Merchant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Transaction Amount</th>
                  <th className="py-3 px-4">Category Average</th>
                  <th className="py-3 px-4 text-right">Deviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs font-sans">
                {anomalyData.outlier_transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{tx.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{tx.description}</td>
                    <td className="py-3 px-4 text-slate-300">{tx.category}</td>
                    <td className="py-3 px-4 font-black font-mono text-amber-400">{formatCurrency(tx.amount)}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{formatCurrency(tx.category_avg)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      +{tx.deviation_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxAndAuditSection;
