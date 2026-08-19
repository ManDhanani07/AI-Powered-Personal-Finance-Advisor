import React from 'react';
import { motion } from 'framer-motion';
import { PieChart as CategoryIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const CategoryForecastList = ({ categoryForecast, totalPredicted }) => {
  const items = categoryForecast && categoryForecast.length > 0 ? categoryForecast : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-6 shadow-glass"
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CategoryIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
              Category Forecast
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Expected spending decomposition across lifestyle & routine categories
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400">
          Total: <strong className="text-white">{formatCurrency(totalPredicted || 0)}</strong>
        </span>
      </div>

      {/* Category Rows with Horizontal Progress Bars */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const catName = item.category || 'Other';
          const amt = Number(item.predicted_amount || 0);
          const pct = Number(item.percentage || 0);
          const barColor = item.color || '#10B981';

          return (
            <div key={idx} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs font-bold font-outfit">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="text-slate-200 group-hover:text-white transition-colors">
                    {catName}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-black text-white font-mono">{formatCurrency(amt)}</span>
                  <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Visual Horizontal Progress Bar */}
              <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CategoryForecastList;
