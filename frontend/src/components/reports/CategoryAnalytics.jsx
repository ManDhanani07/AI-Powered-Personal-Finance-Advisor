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
} from 'recharts';
import { Tag, Store, ArrowRight, Award, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const CategoryAnalytics = ({ categories = [], merchants = [], rawTransactions = [] }) => {
  const navigate = useNavigate();

  if ((!categories || categories.length === 0) && (!merchants || merchants.length === 0)) {
    return <EmptyState title="No Category Data Available" message="Start adding expenses with categories to visualize your spending distribution." />;
  }

  // Highlights
  const highestCategory = categories.length ? categories[0] : null;
  const highestMerchant = merchants.length ? merchants[0] : null;
  
  const largestTx = rawTransactions.length 
    ? [...rawTransactions].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0] 
    : null;

  return (
    <div className="space-y-6">
      {/* Category Highlights Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/30 text-indigo-300">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Highest Spending Category</span>
          </div>
          <h4 className="text-xl font-black text-white mt-2">{highestCategory ? highestCategory.category_name : 'N/A'}</h4>
          <p className="text-xs text-indigo-400 font-mono mt-0.5">
            {highestCategory ? `${formatINR(highestCategory.total_amount)} (${highestCategory.percentage}% of total)` : 'No transactions'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 border border-teal-500/30 text-teal-300">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <Store className="w-4 h-4 text-teal-400" />
            <span>Highest Spending Merchant</span>
          </div>
          <h4 className="text-xl font-black text-white mt-2">{highestMerchant ? highestMerchant.merchant : 'N/A'}</h4>
          <p className="text-xs text-teal-400 font-mono mt-0.5">
            {highestMerchant ? `${formatINR(highestMerchant.total_amount)} (${highestMerchant.frequency} txns)` : 'No merchants'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 text-amber-300">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Largest Single Transaction</span>
          </div>
          <h4 className="text-xl font-black text-white mt-2">{largestTx ? largestTx.title : 'N/A'}</h4>
          <p className="text-xs text-amber-400 font-mono mt-0.5">
            {largestTx ? `${formatINR(largestTx.amount)} on ${largestTx.merchant || 'General'}` : 'No records'}
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut Chart */}
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Category Spending Donut
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
                  itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Merchant Analysis */}
        <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top Merchant Spending
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={merchants} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" tickFormatter={(v) => `₹${v}`} stroke="#94A3B8" fontSize={10} />
                <YAxis dataKey="merchant" type="category" stroke="#94A3B8" fontSize={10} width={90} />
                <Tooltip
                  cursor={false}
                  formatter={(val) => [formatINR(val), 'Total Spent']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
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
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Category Distribution Table
            </h3>
          </div>

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
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">% of Expenses</th>
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

export default CategoryAnalytics;
