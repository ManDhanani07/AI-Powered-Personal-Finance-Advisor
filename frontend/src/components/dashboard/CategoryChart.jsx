import React, { memo, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

// Pure vibrant color palette — strictly 16 distinct non-repeating colors
const PURE_SEGMENT_COLORS = [
  '#EC4899', // 1. Pure Magenta / Pink
  '#3B82F6', // 2. Pure Electric Blue
  '#10B981', // 3. Pure Emerald Green
  '#EF4444', // 4. Pure Vivid Red
  '#F59E0B', // 5. Pure Golden Amber
  '#8B5CF6', // 6. Pure Electric Violet
  '#06B6D4', // 7. Pure Bright Cyan
  '#F97316', // 8. Pure Bright Orange
  '#84CC16', // 9. Pure Lime Green
  '#6366F1', // 10. Pure Indigo
  '#F43F5E', // 11. Pure Rose
  '#14B8A6', // 12. Pure Teal
  '#A855F7', // 13. Pure Deep Purple
  '#0EA5E9', // 14. Pure Sky Blue
  '#D97706', // 15. Pure Burnt Amber
  '#22C55E', // 16. Pure Vivid Green
];

export const CategoryChart = memo(({ charts, loading, onSeeded }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-5 bg-zinc-800 rounded w-1/3" />
        <div className="h-60 bg-zinc-800/60 rounded-2xl" />
      </div>
    );
  }

  const raw = charts?.category_spending || [];
  // Filter out non-positive entries if any
  const filteredRaw = raw.filter((item) => Number(item.value ?? 0) > 0);
  const totalValue = filteredRaw.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  // Map data with non-repeating pure colors & accurate percentage calculation
  const data = filteredRaw.map((d, i) => {
    const val = Number(d.value ?? 0);
    const pct = totalValue > 0 ? (val / totalValue) * 100 : Number(d.percentage ?? 0);
    const pureColor = PURE_SEGMENT_COLORS[i % PURE_SEGMENT_COLORS.length];

    return {
      name: d.category_name,
      value: val,
      percentage: pct,
      fill: pureColor,
    };
  });

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="space-y-4 font-sans">
      <div>
        <h3 className="text-base font-bold text-white font-outfit">
          Category Spending
        </h3>
        <p className="text-xs text-slate-400">Expense distribution across category envelopes</p>
      </div>

      {data.length === 0 ? (
        <EmptyLedgerCallout title="Category Expense Breakdown Empty" onSeeded={onSeeded} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Main Visual Donut Graph */}
          <div className="md:col-span-6 relative flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  minAngle={6}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationDuration={1200}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      stroke={activeIndex === index ? '#FFFFFF' : '#09090B'}
                      strokeWidth={activeIndex === index ? 3 : 1.5}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: 'center center',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Dynamic Center Stat Display matching Slice Color */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest font-outfit truncate max-w-[130px] transition-colors"
                style={{ color: activeItem ? activeItem.fill : '#94A3B8' }}
              >
                {activeItem ? activeItem.name : 'Total Spending'}
              </span>
              <span
                className="text-base font-black font-mono my-0.5 transition-colors"
                style={{ color: activeItem ? activeItem.fill : '#FFFFFF' }}
              >
                {formatCurrency(activeItem ? activeItem.value : totalValue)}
              </span>
              <span
                className="text-[10px] font-bold font-outfit px-2 py-0.5 rounded-full transition-all"
                style={{
                  color: activeItem ? '#FFFFFF' : '#10B981',
                  backgroundColor: activeItem ? activeItem.fill : 'rgba(16, 185, 129, 0.15)',
                }}
              >
                {activeItem
                  ? `${activeItem.percentage.toFixed(1)}% of total`
                  : `${data.length} Categories`}
              </span>
            </div>
          </div>

          {/* Interactive Category Legend */}
          <div className="md:col-span-6 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
            {data.map((item, index) => {
              const isHovered = activeIndex === index;
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-zinc-800/90 border-indigo-500/50 shadow-md translate-x-1'
                      : 'bg-[#12131A] border-zinc-800/60 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span
                      className="text-xs font-bold truncate font-outfit transition-colors"
                      style={{ color: isHovered ? item.fill : '#FFFFFF' }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white block">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

CategoryChart.displayName = 'CategoryChart';
export default CategoryChart;
