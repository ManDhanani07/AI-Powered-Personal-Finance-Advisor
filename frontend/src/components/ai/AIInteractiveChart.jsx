import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Target,
  ShieldCheck,
  Zap,
  ListOrdered,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const PALETTE = ['#F43F5E', '#6366F1', '#10B981', '#06B6D4', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

export const AIInteractiveChart = ({ chartData }) => {
  if (!chartData) return null;

  const { type, title, data, net_savings, savings_rate, target, saved, remaining, percentage, score, grade, factors } = chartData;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload || {};
      const itemName = label || dataPoint.name || payload[0].name;

      return (
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl text-xs font-sans space-y-1.5 min-w-[140px]">
          <p className="font-black text-white font-outfit text-sm border-b border-zinc-800 pb-1">{itemName}</p>
          {payload.map((entry, index) => {
            const isPct = entry.dataKey === 'percentage' || entry.name?.toLowerCase().includes('percent');
            const isCount = entry.dataKey === 'count' || entry.name?.toLowerCase().includes('count');
            
            // If dataPoint has explicit amount in Rupees
            const rupeeAmount = dataPoint.amount !== undefined 
              ? dataPoint.amount 
              : (dataPoint.spent !== undefined 
                ? dataPoint.spent 
                : (!isPct && !isCount ? entry.value : null));

            return (
              <div key={`item-${index}`} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill || '#10B981' }} />
                    <span className="text-slate-400 font-medium capitalize">
                      {isPct ? 'Share' : (isCount ? 'Transactions' : (entry.name || 'Amount'))}:
                    </span>
                  </div>
                  <span className="font-black text-white font-mono">
                    {isCount ? `${entry.value}` : (isPct ? `${entry.value}%` : formatCurrency(entry.value))}
                  </span>
                </div>
                {/* If entry is percentage and we have the exact Rupee amount */}
                {isPct && rupeeAmount !== null && (
                  <div className="flex items-center justify-between text-[11px] pl-3.5 pt-0.5 border-t border-zinc-800/60 mt-0.5">
                    <span className="text-slate-400">Total Spent:</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatCurrency(rupeeAmount)}</span>
                  </div>
                )}
                {/* If entry is amount and we have percentage */}
                {!isPct && dataPoint.percentage !== undefined && (
                  <div className="flex items-center justify-between text-[11px] pl-3.5 pt-0.5 border-t border-zinc-800/60 mt-0.5">
                    <span className="text-slate-400">Share:</span>
                    <span className="font-bold text-emerald-400 font-mono">{dataPoint.percentage}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // 1. Income vs Expense Comparison Bar Chart
  if (type === 'income_vs_expense' || type === 'bar_comparison') {
    const chartItems = data || [
      { name: 'Income', amount: chartData.income || 0, color: '#10B981' },
      { name: 'Expenses', amount: chartData.expenses || 0, color: '#F43F5E' },
    ];

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>{title || 'Income vs Expenses Comparison'}</span>
          </h4>
          {savings_rate !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-[11px] font-outfit">
              {savings_rate}% Savings Rate
            </span>
          )}
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartItems} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
              <XAxis dataKey="name" stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 11, fontWeight: 'bold' }} />
              <YAxis
                stroke="#71717A"
                tick={{ fill: '#71717A', fontSize: 10 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartItems.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || (index === 0 ? '#10B981' : '#F43F5E')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {net_savings !== undefined && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs">
            <span className="text-slate-400 font-medium">Net Monthly Surplus:</span>
            <span className="font-black text-emerald-400 font-mono text-sm">{formatCurrency(net_savings)}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Horizontal Ranked Bars (Top 5 Expenses / Ranked Categories / Transaction Counts)
  if (type === 'horizontal_bars' || type === 'top_5_expenses' || type === 'category_bars' || type === 'transaction_counts') {
    const barItems = data || [];
    const firstItem = barItems[0] || {};
    const keyToUse = firstItem.count !== undefined ? 'count' : (firstItem.percentage !== undefined ? 'percentage' : (firstItem.value !== undefined ? 'value' : 'amount'));
    const isCount = keyToUse === 'count';
    const isPercentage = keyToUse === 'percentage';

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-rose-400" />
            <span>{title || 'Ranked Comparison'}</span>
          </h4>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barItems}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
              <XAxis
                type="number"
                stroke="#71717A"
                tick={{ fill: '#71717A', fontSize: 10 }}
                tickFormatter={(val) => isCount ? `${val}` : (isPercentage ? `${val}%` : `₹${(val / 1000).toFixed(0)}k`)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#71717A"
                width={95}
                tick={{ fill: '#E4E4E7', fontSize: 10, fontWeight: 'bold' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey={keyToUse} radius={[0, 8, 8, 0]}>
                {barItems.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || PALETTE[index % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 3. Category Donut / Pie Chart
  if (type === 'category_donut' || type === 'donut' || type === 'pie') {
    const pieItems = data || [];

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <span>{title || 'Category Spending Distribution'}</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieItems}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {pieItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {pieItems.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || PALETTE[idx % PALETTE.length] }}
                  />
                  <span className="font-bold text-slate-200 truncate max-w-[100px]">{item.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold">{formatCurrency(item.amount)}</span>
                  {item.percentage && <span className="text-slate-400 text-[10px] ml-1">({item.percentage}%)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Monthly Trajectory / Savings Trend / Forecast Area & Line Chart
  if (type === 'monthly_trajectory' || type === 'area' || type === 'trend' || type === 'savings_trend' || type === 'savings_projection' || type === 'forecast_trend' || type === 'forecast_line' || type === 'forecast' || type === 'income_trend' || type === 'expense_trend') {
    const trendItems = data || [];
    const isSavingsChart = type === 'savings_trend' || type === 'savings_projection' || (trendItems[0] && trendItems[0].savings !== undefined);
    const isIncomeChart = type === 'income_trend' || (trendItems[0] && trendItems[0].income !== undefined && trendItems[0].expense === undefined && trendItems[0].expenses === undefined);
    const isExpenseChart = type === 'expense_trend' || (trendItems[0] && (trendItems[0].expense !== undefined || trendItems[0].expenses !== undefined) && trendItems[0].income === undefined);
    const isForecastChart = type === 'forecast' || type === 'forecast_trend' || type === 'forecast_line' || (trendItems[0] && (trendItems[0].forecast !== undefined || trendItems[0].historical !== undefined));
    const randomId = Math.random().toString(36).substring(2, 7);

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${isExpenseChart ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>{title || (isForecastChart ? 'Meta Prophet Spending Forecast' : (isSavingsChart ? 'Monthly Savings Trajectory' : (isIncomeChart ? 'Monthly Income Trend' : (isExpenseChart ? 'Monthly Expense Trajectory' : 'Monthly Financial Trajectory'))))}</span>
          </h4>
          {isForecastChart && (
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] font-outfit">
              Prophet AI Model
            </span>
          )}
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendItems} margin={{ top: 15, right: 15, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradInc_${randomId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id={`gradExp_${randomId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id={`gradSav_${randomId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id={`gradFcst_${randomId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
              <XAxis dataKey={trendItems[0]?.period !== undefined ? "period" : "month"} stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 11, fontWeight: 'bold' }} />
              <YAxis
                stroke="#71717A"
                width={55}
                domain={isForecastChart ? ['dataMin - 10000', 'dataMax + 10000'] : ['auto', 'auto']}
                tick={{ fill: '#A1A1AA', fontSize: 10, fontWeight: 'bold' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {isForecastChart ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name="Prophet Forecast"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#gradFcst_${randomId})`}
                    dot={{ r: 6, fill: '#8B5CF6', stroke: '#1e1b4b', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#A78BFA' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="historical"
                    name="Historical Actual"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={0.2}
                    fill={`url(#gradInc_${randomId})`}
                    dot={{ r: 6, fill: '#10B981', stroke: '#064e3b', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#34D399' }}
                    connectNulls
                  />
                </>
              ) : isSavingsChart ? (
                <Area type="monotone" dataKey={trendItems[0]?.projected_total !== undefined ? "projected_total" : (trendItems[0]?.savings !== undefined ? "savings" : "amount")} name="Savings" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill={`url(#gradSav_${randomId})`} dot={{ r: 5, fill: '#06B6D4', stroke: '#083344', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              ) : isIncomeChart ? (
                <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill={`url(#gradInc_${randomId})`} dot={{ r: 5, fill: '#10B981', stroke: '#064e3b', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              ) : isExpenseChart ? (
                <Area type="monotone" dataKey={trendItems[0]?.expense !== undefined ? "expense" : "expenses"} name="Expense" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill={`url(#gradExp_${randomId})`} dot={{ r: 5, fill: '#F43F5E', stroke: '#881337', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              ) : (
                <>
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill={`url(#gradInc_${randomId})`} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey={trendItems[0]?.expense !== undefined ? "expense" : "expenses"} name="Expense" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill={`url(#gradExp_${randomId})`} dot={{ r: 4, fill: '#F43F5E' }} activeDot={{ r: 6 }} />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 5. Daily Spending Line Chart
  if (type === 'daily_line' || type === 'daily_spending') {
    const dailyItems = data || [];

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{title || 'Daily Spending Trajectory'}</span>
          </h4>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyItems} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
              <XAxis dataKey="day" stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
              <YAxis
                stroke="#71717A"
                tick={{ fill: '#71717A', fontSize: 10 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" name="Daily Spend" stroke="#F43F5E" strokeWidth={2.5} dot={{ fill: '#F43F5E', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 6. Goal Progress Gauge / Multi-Goal Progress
  if (type === 'goal_progress' || type === 'goals_list') {
    const goalsList = data || (target !== undefined ? [{ name: title || 'Goal', saved, target, remaining, percentage: percentage || (target > 0 ? (saved / target) * 100 : 0) }] : []);

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>{title || 'Savings Goal Progress'}</span>
          </h4>
          {goalsList.length === 1 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[11px] font-outfit">
              {(goalsList[0].percentage || (goalsList[0].target > 0 ? (goalsList[0].saved / goalsList[0].target) * 100 : 0)).toFixed(1)}% Completed
            </span>
          )}
        </div>

        <div className="space-y-4 pt-1">
          {goalsList.map((g, idx) => {
            const gPct = g.percentage || (g.target > 0 ? (g.saved / g.target) * 100 : 0);
            const gRem = g.remaining !== undefined ? g.remaining : Math.max(0, g.target - g.saved);

            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white font-medium">{g.name}</span>
                  <span className="text-slate-300">
                    <strong className="text-emerald-400">{formatCurrency(g.saved)}</strong> / {formatCurrency(g.target)} ({gPct.toFixed(1)}%)
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 transition-all duration-500 shadow-glow"
                    style={{ width: `${Math.min(100, Math.max(0, gPct))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Remaining: <strong className="text-rose-400">{formatCurrency(gRem)}</strong></span>
                  <span className="text-emerald-400 font-semibold">{g.status || '🟢 On Track'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 7. Budget Bars / Budget vs Actual
  if (type === 'budget_bars' || type === 'budget_utilization') {
    const budgetList = data || [];

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{title || 'Envelope Budget Utilization'}</span>
          </h4>
        </div>

        <div className="space-y-3.5 pt-1">
          {budgetList.map((b, idx) => {
            const pct = b.percentage !== undefined ? b.percentage : (b.limit > 0 ? (b.spent / b.limit) * 100 : 0);
            const isExceeded = pct >= 100;
            const isAlmost = pct >= 90 && pct < 100;
            const isApproaching = pct >= 70 && pct < 90;
            const statusLabel = isExceeded ? '🔴 Exceeded' : (isAlmost ? '🟠 Almost Exhausted' : (isApproaching ? '🟡 Approaching Limit' : '🟢 Under Control'));

            const barColor = isExceeded
              ? 'from-rose-500 to-red-600'
              : (isAlmost
                ? 'from-amber-500 to-orange-500'
                : (isApproaching ? 'from-yellow-400 to-amber-500' : 'from-cyan-500 via-teal-400 to-emerald-400'));

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold items-center">
                  <span className="text-white font-medium">{b.category || b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${isExceeded ? 'text-rose-400' : 'text-slate-300'}`}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.limit || b.budget)} ({pct.toFixed(1)}%)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-300">
                      {statusLabel}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500 shadow-glow`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
                {b.remaining !== undefined && (
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{isExceeded ? `Over limit by ${formatCurrency(b.spent - (b.limit || b.budget))}` : `Remaining: ${formatCurrency(b.remaining)}`}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 7.5 Reduction Scenario Comparison Card
  if (type === 'reduction_scenario') {
    const scenarioItems = data || [];
    const potSavings = chartData.potential_savings || (scenarioItems[0] && scenarioItems[1] ? scenarioItems[0].amount - scenarioItems[1].amount : 0);

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{title || 'Expense Reduction Simulation'}</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-[11px] font-outfit">
            Save +{formatCurrency(potSavings)}/mo
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {scenarioItems.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-white font-mono">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (item.amount / (scenarioItems[0]?.amount || 1)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. Financial Health Gauge & Diagnostics
  if (type === 'health_gauge') {
    const healthScore = score !== undefined ? score : (chartData.overall_score || 62);
    const healthGrade = grade || chartData.grade || 'D';
    const statusText = chartData.status || (healthScore >= 80 ? 'Excellent' : (healthScore >= 70 ? 'Good' : (healthScore >= 55 ? 'Needs Improvement' : 'Critical')));

    return (
      <div className="my-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider font-outfit flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{title || 'Financial Health Score'}</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-black text-[11px] font-outfit">
            Grade: {healthGrade} ({healthScore}/100)
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Overall Health</span>
            <span className="text-white font-mono">{healthScore} / 100 · {statusText}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : healthScore >= 60
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-600 to-rose-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, healthScore))}%` }}
            />
          </div>
        </div>

        {factors && (
          <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-outfit">Factor Breakdown</p>
            {factors.map((f, idx) => {
              const isBad = (f.status && f.status.includes('🔴')) || (f.status && f.status.toLowerCase().includes('needs improvement'));
              const isMod = (f.status && f.status.includes('🟡')) || (f.status && f.status.toLowerCase().includes('moderate'));
              const fPct = f.score !== undefined && f.max_score ? Math.round((f.score / f.max_score) * 100) : (f.percentage !== undefined ? f.percentage : (isBad ? 30 : (isMod ? 60 : 85)));

              return (
                <div key={idx} className="space-y-1 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-bold">{f.name}</span>
                    <span className={`text-[11px] font-bold ${isBad ? 'text-rose-400' : (isMod ? 'text-amber-400' : 'text-emerald-400')}`}>
                      {f.status || (isBad ? '🔴 Needs Improvement' : (isMod ? '🟡 Moderate' : '🟢 Good'))}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isBad ? 'bg-rose-500' : (isMod ? 'bg-amber-400' : 'bg-emerald-400')}`}
                      style={{ width: `${Math.min(100, fPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AIInteractiveChart;
