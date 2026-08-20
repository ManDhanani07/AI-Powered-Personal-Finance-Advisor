import React, { useState } from 'react';
import { Palette, Globe, Target, Wallet, CheckCircle2 } from 'lucide-react';
import ThemeSelector from './ThemeSelector.jsx';
import { toast } from 'react-toastify';

export const PreferencesCard = () => {
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [savingsTargetPct, setSavingsTargetPct] = useState(30);
  const [budgetRule, setBudgetRule] = useState('50_30_20');

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-6 shadow-sm space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-black text-white font-outfit">Financial & System Preferences</h3>
        <p className="text-xs text-slate-400">Configure currency defaults, target savings goals, budgeting framework, and appearance</p>
      </div>

      {/* Financial Goals & Budgeting Strategy */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Target className="h-4 w-4 text-emerald-400" />
          <span>Financial Strategy &amp; Savings Target</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#000000] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Target Monthly Savings Rate</label>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                {savingsTargetPct}% of Income
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={savingsTargetPct}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSavingsTargetPct(val);
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% (Frugal)</span>
              <span>30% (Standard)</span>
              <span>50%+ (Aggressive Wealth Builder)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#000000] space-y-2">
            <label className="text-xs font-bold text-white">Default Budgeting Strategy</label>
            <select
              value={budgetRule}
              onChange={(e) => {
                setBudgetRule(e.target.value);
                toast.success('Budget strategy updated.');
              }}
              className="w-full rounded-xl border border-zinc-800 py-2.5 px-3 text-xs font-medium bg-[#09090B] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
            >
              <option value="50_30_20">50/30/20 Framework (50% Needs, 30% Wants, 20% Savings)</option>
              <option value="envelope">Category Envelope Budgeting (Hard monthly caps)</option>
              <option value="zero_based">Zero-Based Budgeting (Every rupee assigned a job)</option>
            </select>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Used by AI Advisor and Financial Health score to evaluate your monthly cash flow allocation.
            </p>
          </div>
        </div>
      </div>

      {/* Localization & Region */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Globe className="h-4 w-4 text-emerald-400" />
          <span>Currency &amp; Regional Formats</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                toast.success(`Primary currency set to ${e.target.value}`);
              }}
              className="w-full rounded-xl border border-zinc-800 py-2.5 px-3 text-xs font-medium bg-[#000000] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 py-2.5 px-3 text-xs font-medium bg-[#000000] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC (GMT +0:00)</option>
              <option value="America/New_York">America/New_York (EST -5:00)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 py-2.5 px-3 text-xs font-medium bg-[#000000] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
            >
              <option value="DD MMM YYYY">01 Aug 2026</option>
              <option value="DD/MM/YYYY">01/08/2026</option>
              <option value="YYYY-MM-DD">2026-08-01</option>
            </select>
          </div>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Palette className="h-4 w-4 text-emerald-400" />
          <span>Interface Appearance</span>
        </div>
        <ThemeSelector />
      </div>
    </div>
  );
};

export default PreferencesCard;
