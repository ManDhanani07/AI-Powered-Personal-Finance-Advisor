import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { Tag, Store, ArrowRight, DollarSign, TrendingUp, Award, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const SpendingAnalysisSection = ({ categories = [], merchants = [], rawTransactions = [], comparison }) => {
  const navigate = useNavigate();

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

  const totalSpending = categories.reduce((sum, c) => sum + Number(c.total_amount || 0), 0);
  const totalTxCount = categories.reduce((sum, c) => sum + Number(c.tx_count || 1), 0);
  const avgTransaction = totalTxCount > 0 ? totalSpending / totalTxCount : 0;

  const highestCategory = categories.length ? categories[0] : null;
  const topMerchant = merchants.length ? merchants[0] : null;

  const largestTx = rawTransactions.length
    ? [...rawTransactions].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0]
    : null;

  // Generate spending insights
  const spendingInsights = [];
  if (highestCategory) {
    spendingInsights.push(`${highestCategory.category_name} is currently your highest spending category (${highestCategory.percentage}% of total expenses).`);
  }
  if (topMerchant) {
    spendingInsights.push(`${topMerchant.merchant} is your most frequent merchant with ${formatINR(topMerchant.total_amount)} total spend.`);
  }
  if (largestTx) {
    spendingInsights.push(`Your largest single transaction was ${formatINR(largestTx.amount)} for "${largestTx.title || 'Expense'}".`);
  }
  if (comparison && comparison.total_expenses && comparison.total_expenses.pct_change !== 0) {
    const dir = comparison.total_expenses.pct_change > 0 ? 'increased' : 'decreased';
    spendingInsights.push(`Overall expenses ${dir} by ${Math.abs(comparison.total_expenses.pct_change)}% compared with the previous period.`);
  }

  return (
    <div className="space-y-6">
      {/* 5 Spending Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Spending</span>
          <h3 className="text-xl font-black text-white mt-1">{formatINR(totalSpending)}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Average Transaction</span>
          <h3 className="text-xl font-black text-white mt-1">{formatINR(avgTransaction)}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Largest Transaction</span>
          <h3 className="text-xl font-black text-white mt-1">{largestTx ? formatINR(largestTx.amount) : 'N/A'}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Top Category</span>
          <h3 className="text-xl font-black text-white mt-1">{highestCategory ? highestCategory.category_name : 'N/A'}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Top Merchant</span>
          <h3 className="text-xl font-black text-white mt-1">{topMerchant ? topMerchant.merchant : 'N/A'}</h3>
        </div>
      </div>

      {/* Spending Insights Banner */}
      {spendingInsights.length > 0 && (
        <div className="p-5 rounded-3xl bg-bg-surface/80 border border-border-subtle backdrop-blur-xl space-y-2 shadow-lg">
          <h4 className="text-xs font-extrabold text-primary-400 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Automated Spending Insights</span>
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
            {spendingInsights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary-400 font-bold">•</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Spending Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Spending by Category */}
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-400" />
              <span>Spending by Category</span>
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total_amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {categories.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || '#6366F1'} stroke="#0F172A" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Spent']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Top Merchants */}
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-400" />
              <span>Top Merchant Spending</span>
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={merchants.slice(0, 10)} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" tickFormatter={(v) => `₹${v}`} stroke="#94A3B8" fontSize={10} />
                <YAxis dataKey="merchant" type="category" stroke="#94A3B8" fontSize={10} width={90} />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Total Spent']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                />
                <Bar dataKey="total_amount" fill="#6366F1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary-400" />
            <span>Category Spending Breakdown</span>
          </h3>

          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 text-xs font-bold transition-all border border-primary-500/30"
          >
            <span>View Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Tx Count</th>
                <th className="py-3 px-4">Avg Per Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-slate-200">
              {categories.map((cat, i) => {
                const avgVal = cat.tx_count > 0 ? cat.total_amount / cat.tx_count : 0;
                return (
                  <tr key={i} className="hover:bg-bg-card/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#6366F1' }} />
                      <span>{cat.category_name}</span>
                    </td>
                    <td className="py-3 px-4 font-black text-white">{formatINR(cat.total_amount)}</td>
                    <td className="py-3 px-4 font-mono text-primary-300">{cat.percentage}%</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{cat.tx_count || 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{formatINR(avgVal)}</td>
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
