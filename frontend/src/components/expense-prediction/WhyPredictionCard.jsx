import React from 'react';
import { TrendingUp, RefreshCw, BarChart3, HelpCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const WhyPredictionCard = ({
  forecast,
  benchmarks,
  trendMetrics,
  sanitizedSummary,
  totalRecurringAmount,
  recurringExpenses = [],
  categoryForecast = [],
}) => {
  const predictedSpend = Number(forecast?.predicted_routine_spend || 0);
  const lastMonthActual = Number(
    benchmarks?.last_month_actual || trendMetrics?.last_month_expense || 0
  );

  const insights = [];

  // 1. Forecast Trajectory vs Last Month Actual (100% factual math)
  if (lastMonthActual > 0 && predictedSpend > 0) {
    const diff = predictedSpend - lastMonthActual;
    const diffPct = (diff / lastMonthActual) * 100;
    const absDiffPct = Math.abs(diffPct).toFixed(1);

    if (Math.abs(diffPct) < 2.5) {
      insights.push({
        icon: TrendingUp,
        title: 'Steady Spending Trajectory',
        text: `Your forecasted expense of ${formatCurrency(predictedSpend)} closely mirrors last month's actual expenditure of ${formatCurrency(lastMonthActual)} (${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}% variance).`,
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
      });
    } else if (diffPct >= 2.5) {
      insights.push({
        icon: TrendingUp,
        title: 'Projected Spend Increase',
        text: `Forecasted at ${formatCurrency(predictedSpend)}, reflecting a +${absDiffPct}% change (+${formatCurrency(diff)}) above last month's actual spend of ${formatCurrency(lastMonthActual)}.`,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
      });
    } else {
      insights.push({
        icon: TrendingUp,
        title: 'Projected Spend Decrease',
        text: `Forecasted at ${formatCurrency(predictedSpend)}, projecting a -${absDiffPct}% reduction (-${formatCurrency(Math.abs(diff))}) below last month's actual spend of ${formatCurrency(lastMonthActual)}.`,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
      });
    }
  } else {
    insights.push({
      icon: TrendingUp,
      title: 'Baseline Projection',
      text: `Forecast of ${formatCurrency(predictedSpend)} calibrated directly from verified historical transaction clusters.`,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    });
  }

  // 2. Fixed & Recurring Commitments (Derived strictly from user's detected recurring items)
  const recAmt = Number(
    totalRecurringAmount ||
      (recurringExpenses && recurringExpenses.length > 0
        ? recurringExpenses.reduce((s, r) => s + (r.amount || 0), 0)
        : 0)
  );

  if (recAmt > 0 && predictedSpend > 0) {
    const recSharePct = Math.min(100, Math.round((recAmt / predictedSpend) * 100));
    const topRecNames = (recurringExpenses || [])
      .slice(0, 2)
      .map((r) => r.name || r.merchant || r.category)
      .filter(Boolean)
      .join(' & ');

    insights.push({
      icon: RefreshCw,
      title: 'Committed Recurring Baseline',
      text: topRecNames
        ? `Contractual recurring obligations (${topRecNames}) total ${formatCurrency(recAmt)}, accounting for ${recSharePct}% of your expected expense.`
        : `Verified recurring commitments total ${formatCurrency(recAmt)} (${recSharePct}% of total forecast), creating a predictable floor.`,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    });
  } else {
    const routineAmt = Number(sanitizedSummary?.clean_routine_spend || 0);
    insights.push({
      icon: RefreshCw,
      title: 'Routine Living Baseline',
      text: routineAmt > 0
        ? `Routine grocery and essential living expenses are calibrated at ${formatCurrency(routineAmt)} based on your clean transaction patterns.`
        : 'Daily essentials form the primary foundation of this monthly forecast.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    });
  }

  // 3. Primary Expense Driver or Multi-Month Historical Average
  const topCat = Array.isArray(categoryForecast) && categoryForecast.length > 0 ? categoryForecast[0] : null;
  const threeMonthAvg = Number(benchmarks?.three_month_avg || 0);

  if (topCat && topCat.predicted_amount > 0) {
    insights.push({
      icon: BarChart3,
      title: `Highest Driver: ${topCat.category}`,
      text: `${topCat.category} forms your largest spending category at ${formatCurrency(topCat.predicted_amount)} (${Number(topCat.percentage || 0).toFixed(1)}% of total projected outflows).`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    });
  } else if (threeMonthAvg > 0) {
    insights.push({
      icon: ShieldCheck,
      title: '3-Month Historical Average',
      text: `Your recent 3-month average spending is ${formatCurrency(threeMonthAvg)}, confirming historical consistency with the predicted ${formatCurrency(predictedSpend)}.`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    });
  } else {
    insights.push({
      icon: ShieldCheck,
      title: 'Spending Regularity',
      text: 'Historical transaction frequency demonstrates steady living patterns with minimal unplanned financial volatility.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    });
  }

  // Strictly maximum 3 insights
  const displayInsights = insights.slice(0, 3);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-glass backdrop-blur-xl space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-outfit">
            Why this prediction?
          </h2>
          <p className="text-xs text-slate-400 font-outfit">
            Real data drivers and mathematical factors behind your forecast
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayInsights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${insight.bgColor} ${insight.borderColor} border`}>
                    <Icon className={`w-3.5 h-3.5 ${insight.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-200 font-outfit">
                    {insight.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-outfit leading-relaxed">
                  {insight.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhyPredictionCard;
