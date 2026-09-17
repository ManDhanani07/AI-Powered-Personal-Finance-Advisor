import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Tag,
  Store,
  ArrowRight,
  TrendingUp,
  Award,
  ShoppingBag,
  DollarSign,
  Percent,
  Layers,
  ChevronRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';
import { formatCurrency } from '../../utils/formatters.js';

// Curated vibrant accessible palette for category slices
const PALETTE = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#A855F7', // Violet
  '#64748B', // Slate
];

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-3.5 shadow-2xl space-y-1.5 min-w-[200px] font-sans">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: item.color || '#6366F1' }}
        />
        <span className="font-extrabold text-white font-outfit text-xs truncate">
          {item.category_name}
        </span>
      </div>
      <div className="space-y-1 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400 font-sans">Expenditure:</span>
          <span className="font-black text-white">{formatCurrency(item.total_amount)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400 font-sans">Share of Outflow:</span>
          <span className="font-bold text-primary-400">{item.percentage}%</span>
        </div>
        {item.tx_count && (
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-sans">Transactions:</span>
            <span>{item.tx_count} entries</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SpendingAnalysisSection = ({
  categories = [],
  merchants = [],
  rawTransactions = [],
  comparison,
}) => {
  const navigate = useNavigate();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);

  if ((!categories || categories.length === 0) && (!merchants || merchants.length === 0)) {
    return (
      <EmptyState
        title="No Spending Data Available"
        message="Start adding transactions with categories to visualize your spending distribution."
        actionText="Add Transactions"
        actionLink="/transactions"
      />
    );
  }

  const totalSpending = useMemo(
    () => categories.reduce((sum, c) => sum + Number(c.total_amount || 0), 0),
    [categories]
  );

  const totalTxCount = useMemo(
    () => categories.reduce((sum, c) => sum + Number(c.tx_count || 1), 0),
    [categories]
  );

  const avgTransaction = totalTxCount > 0 ? totalSpending / totalTxCount : 0;
  const highestCategory = categories.length ? categories[0] : null;
  const topMerchant = merchants.length ? merchants[0] : null;

  const largestTx = useMemo(() => {
    if (!rawTransactions || rawTransactions.length === 0) return null;
    return [...rawTransactions].sort(
      (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
    )[0];
  }, [rawTransactions]);

  // Prepared categorized items with fallback colors
  const formattedCategories = useMemo(() => {
    return categories.map((cat, idx) => ({
      ...cat,
      color: cat.color || PALETTE[idx % PALETTE.length],
      percentage: Number(
        cat.percentage ||
          (totalSpending > 0 ? ((cat.total_amount / totalSpending) * 100).toFixed(1) : 0)
      ),
    }));
  }, [categories, totalSpending]);

  // Max merchant amount for relative progress bar scaling
  const maxMerchantSpend = useMemo(() => {
    if (!merchants.length) return 1;
    return Math.max(...merchants.map((m) => Number(m.total_amount || 0)), 1);
  }, [merchants]);

  // Automated spending insights
  const spendingInsights = useMemo(() => {
    const list = [];
    if (highestCategory) {
      list.push(
        `${highestCategory.category_name} dominates your spending, representing ${highestCategory.percentage}% of all recorded outflows.`
      );
    }
    if (topMerchant) {
      list.push(
        `${topMerchant.merchant} is your highest concentration beneficiary at ${formatCurrency(topMerchant.total_amount)}.`
      );
    }
    if (largestTx) {
      list.push(
        `Largest audited transaction: ${formatCurrency(largestTx.amount)} (${largestTx.description || largestTx.merchant || 'Expense'}).`
      );
    }
    if (comparison?.total_expenses?.pct_change) {
      const dir = comparison.total_expenses.pct_change > 0 ? 'increased' : 'decreased';
      list.push(
        `Total cycle expenditure ${dir} by ${Math.abs(comparison.total_expenses.pct_change)}% relative to the prior period.`
      );
    }
    return list;
  }, [highestCategory, topMerchant, largestTx, comparison]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Top Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-rose-500/20 backdrop-blur-xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 font-outfit">
            Total Spending
          </span>
          <h3 className="text-xl font-black text-white font-mono tracking-tight">
            {formatCurrency(totalSpending)}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Across {totalTxCount} transactions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-amber-500/20 backdrop-blur-xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 font-outfit">
            Average Transaction
          </span>
          <h3 className="text-xl font-black text-white font-mono tracking-tight">
            {formatCurrency(avgTransaction)}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">Mean expense size</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-purple-500/20 backdrop-blur-xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 font-outfit">
            Largest Transaction
          </span>
          <h3 className="text-xl font-black text-white font-mono tracking-tight truncate">
            {largestTx ? formatCurrency(largestTx.amount) : 'N/A'}
          </h3>
          <p className="text-[11px] text-slate-400 truncate font-mono">
            {largestTx?.merchant || largestTx?.category || 'Single Peak'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-indigo-500/20 backdrop-blur-xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 font-outfit">
            Top Category
          </span>
          <h3 className="text-xl font-black text-white font-outfit truncate">
            {highestCategory ? highestCategory.category_name : 'N/A'}
          </h3>
          <p className="text-[11px] text-indigo-300 font-mono">
            {highestCategory ? `${highestCategory.percentage}% of budget` : ''}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-teal-500/20 backdrop-blur-xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 font-outfit">
            Top Merchant
          </span>
          <h3 className="text-xl font-black text-white font-outfit truncate">
            {topMerchant ? topMerchant.merchant : 'N/A'}
          </h3>
          <p className="text-[11px] text-teal-300 font-mono">
            {topMerchant ? formatCurrency(topMerchant.total_amount) : ''}
          </p>
        </div>
      </div>

      {/* 2. Automated Strategic Insights */}
      {spendingInsights.length > 0 && (
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl space-y-2.5 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Award className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit">
              Automated Spending Diagnostics
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
            {spendingInsights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-zinc-900/50 p-2.5 rounded-2xl border border-zinc-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Side-by-Side Symmetrical Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Spending by Category */}
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-outfit">
                  Spending by Category
                </h3>
                <p className="text-[11px] text-slate-400">Proportional expenditure allocation</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-slate-300">
              {formattedCategories.length} Categories
            </span>
          </div>

          {/* Donut Chart with Centered Total Outflow */}
          <div className="h-72 w-full relative flex items-center justify-center flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCategories}
                  dataKey="total_amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={78}
                  outerRadius={115}
                  paddingAngle={3}
                  onMouseEnter={(_, idx) => setActiveCategoryIndex(idx)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  {formattedCategories.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.color}
                      stroke="#09090B"
                      strokeWidth={2}
                      opacity={activeCategoryIndex === null || activeCategoryIndex === idx ? 1 : 0.45}
                      className="transition-opacity duration-200 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-outfit">
                Total Outflow
              </span>
              <span className="text-xl font-black font-mono text-white tracking-tight mt-0.5">
                {formatCurrency(totalSpending)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                {formattedCategories.length} Categories
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Top Merchant Spending */}
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-outfit">
                  Top Merchant Spending
                </h3>
                <p className="text-[11px] text-slate-400">Leading vendor outflows and recurring payees</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-300">
              Top {Math.min(10, merchants.length)} Ranked
            </span>
          </div>

          {/* High-Readability Merchant Progress Ledger (Zero Cut-Offs & Electric Sapphire Blue / Cyan Fill) */}
          <div className="max-h-72 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800 flex-1">
            {merchants.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                No merchant activity recorded.
              </div>
            ) : (
              merchants.slice(0, 10).map((m, idx) => {
                const amt = Number(m.total_amount || 0);
                const pctOfMax = Math.min(100, Math.round((amt / maxMerchantSpend) * 100));
                const totalMerchantSum = merchants.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
                const sharePct = totalMerchantSum > 0 ? ((amt / totalMerchantSum) * 100).toFixed(1) : 0;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-blue-500/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 bg-zinc-850 text-slate-300 border border-zinc-750 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-colors">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-100 truncate font-outfit text-xs block group-hover:text-white transition-colors">
                            {m.merchant}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {m.tx_count ? `${m.tx_count} txs` : 'Direct Payee'} • <span className="text-cyan-400 font-medium">{sharePct}% of vendor outflow</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-black text-white text-xs block">
                          {formatCurrency(amt)}
                        </span>
                      </div>
                    </div>

                    {/* Electric Sapphire Blue to Cyan progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                      <div
                        style={{ width: `${pctOfMax}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Complete Category Spending Audit Table */}
      <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Category Spending Ledger Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comprehensive tabular audit across all active category vectors.
            </p>
          </div>

          <button
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 text-xs font-bold transition-all border border-primary-500/30 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-zinc-800/80 text-slate-400 font-extrabold uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Share (%)</th>
                <th className="py-3 px-4">Transaction Count</th>
                <th className="py-3 px-4 text-right">Average per Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-slate-200">
              {formattedCategories.map((cat, i) => {
                const count = Number(cat.tx_count || 1);
                const avgVal = count > 0 ? Number(cat.total_amount || 0) / count : 0;
                return (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-2.5 font-bold text-white">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-outfit">{cat.category_name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-white">
                      {formatCurrency(cat.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-400">
                      {cat.percentage}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {count} entries
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-right font-bold">
                      {formatCurrency(avgVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysisSection;
