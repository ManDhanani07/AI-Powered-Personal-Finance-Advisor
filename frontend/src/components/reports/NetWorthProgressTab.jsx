import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, ShieldCheck, Wallet, PieChart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import dashboardService from '../../services/dashboardService.js';

export const NetWorthProgressTab = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOverview = async () => {
      try {
        const res = await dashboardService.getCompleteDashboard(10);
        const payload = res?.data?.data ?? res?.data;
        if (isMounted && payload?.overview) {
          setOverview(payload.overview);
        }
      } catch (err) {
        console.error('Error loading Net Worth overview:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-800/60 rounded-3xl" />
          <div className="h-48 bg-slate-800/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  const netWorth = Number(overview?.net_worth ?? 0);
  const totalIncome = Number(overview?.total_income ?? 0);
  const totalExpenses = Number(overview?.total_expenses ?? 0);
  const netSavings = Number(overview?.net_savings ?? 0);

  const assetsList = [
    { name: 'Cumulative Savings & Cash Surplus', value: Math.max(0, netSavings), category: 'Liquid Cash Buffer' },
    { name: 'Total Cumulative Income Received', value: totalIncome, category: 'Income Flows' },
  ].filter((a) => a.value > 0);

  const liabilitiesList = [
    { name: 'Total Cumulative Expenses Paid', value: totalExpenses, category: 'Outflows' },
  ].filter((l) => l.value > 0);

  const totalAssets = assetsList.reduce((acc, a) => acc + a.value, 0);
  const totalLiabilities = liabilitiesList.reduce((acc, l) => acc + l.value, 0);

  if (!totalAssets && !totalLiabilities) {
    return (
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-glass flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400">
          <Landmark className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-white font-outfit">No Net Worth Data Recorded</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Add transactions to track your live asset build-up, liability balance, and total net worth.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculated Total Net Worth</p>
          <p className="text-4xl font-black text-emerald-400 font-outfit">
            {formatCurrency(netWorth)}
          </p>
          <p className="text-xs text-slate-400">
            Assets ({formatCurrency(totalAssets)}) − Expenses ({formatCurrency(totalLiabilities)})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>PostgreSQL Calculated Net Worth</span>
          </div>
        </div>
      </div>

      {/* Assets & Liabilities Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Column */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Assets & Cumulative Inflows
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {formatCurrency(totalAssets)}
            </span>
          </div>

          <div className="space-y-2.5">
            {assetsList.map((asset) => (
              <div
                key={asset.name}
                className="p-3.5 rounded-2xl bg-bg-surface/80 border border-border-subtle flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-200">{asset.name}</p>
                  <p className="text-[10px] text-slate-400">{asset.category}</p>
                </div>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(asset.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities / Expenses Column */}
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-rose-400" />
              Outflows & Expenses
            </h4>
            <span className="text-xs font-mono font-bold text-rose-400">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>

          <div className="space-y-2.5">
            {liabilitiesList.map((liab) => (
              <div
                key={liab.name}
                className="p-3.5 rounded-2xl bg-bg-surface/80 border border-border-subtle flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-200">{liab.name}</p>
                  <p className="text-[10px] text-slate-400">{liab.category}</p>
                </div>
                <span className="font-mono font-bold text-rose-400">{formatCurrency(liab.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthProgressTab;
