import React, { memo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import { formatCompactFinancial, formatCurrency } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

const FALLBACK_COLORS = [
  '#EC4899', '#6366F1', '#10B981', '#F59E0B',
  '#3B82F6', '#8B5CF6', '#14B8A6', '#F43F5E',
];

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-2xl border border-border-strong bg-bg-surface/95 backdrop-blur-xl shadow-2xl p-3.5 text-xs min-w-[170px]">
      <p className="font-bold text-white font-outfit border-b border-border-subtle pb-1.5 mb-2">{d.name}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-400">Outflow:</span>
          <span className="font-bold text-white font-mono">{formatCurrency(d.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-400">Share:</span>
          <span className="font-bold text-emerald-400 font-mono">{Number(d.payload?.percentage ?? 0).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const SkeletonChart = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-5 bg-slate-800 rounded w-1/3" />
    <div className="h-60 bg-slate-800/60 rounded-2xl" />
  </div>
);

export const CategoryChart = memo(({ charts, loading, onSeeded }) => {
  const [viewMode, setViewMode] = useState('pie'); // 'pie' | 'radial'
  const [activeIndex, setActiveIndex] = useState(null);

  if (loading) return <SkeletonChart />;

  const raw = charts?.category_spending || [];
  const totalValue = raw.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  const data = raw.map((d, i) => ({
    name: d.category_name,
    value: Number(d.value ?? 0),
    percentage: Number(d.percentage ?? 0),
    fill: d.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
            <span>Category Spending</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              Breakdown
            </span>
          </h3>
          <p className="text-xs text-slate-400">Expense distribution across category envelopes</p>
        </div>
        {data.length > 0 && (
          <div className="flex bg-slate-900/80 border border-border-subtle rounded-xl p-1 gap-1">
            {['pie', 'radial'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'pie' ? '3D Donut' : 'Radial Rings'}
              </button>
            ))}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyLedgerCallout title="Category Expense Breakdown Empty" onSeeded={onSeeded} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Chart Graphic Area */}
          <div className="md:col-span-7 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              {viewMode === 'pie' ? (
                <PieChart>
                  <defs>
                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.4" />
                    </filter>
                  </defs>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={5}
                    minAngle={12}
                    dataKey="value"
                    filter="url(#pieShadow)"
                    animationDuration={1400}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.fill}
                        stroke={activeIndex === i ? '#FFFFFF' : 'rgba(30, 41, 59, 0.8)'}
                        strokeWidth={activeIndex === i ? 3 : 2}
                        style={{
                          transform: activeIndex === i ? 'scale(1.04)' : 'scale(1)',
                          transformOrigin: 'center center',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="25%"
                  outerRadius="95%"
                  data={data}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    minAngle={15}
                    background={{ fill: 'rgba(255,255,255,0.03)' }}
                    dataKey="value"
                    cornerRadius={6}
                    animationDuration={1400}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </RadialBar>
                </RadialBarChart>
              )}
            </ResponsiveContainer>

            {/* Dynamic Interactive Donut Center Metric Lens (Zero Overlapping Text) */}
            {viewMode === 'pie' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {activeItem ? (
                  <>
                    <span
                      className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full mb-1"
                      style={{ color: activeItem.fill, backgroundColor: `${activeItem.fill}20` }}
                    >
                      {activeItem.name}
                    </span>
                    <span className="text-lg font-black text-white font-outfit tracking-tight">
                      {formatCurrency(activeItem.value)}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-400 mt-0.5">
                      {activeItem.percentage.toFixed(1)}% of total
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Spent</span>
                    <span className="text-xl font-black text-white font-outfit tracking-tight">
                      {formatCompactFinancial(totalValue)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {data.length} Categories
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Clean Interactive Legend List */}
          <div className="md:col-span-5 space-y-2.5 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {data.map((item, idx) => {
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-primary-500/10 border-primary-500/50 shadow-lg scale-[1.02]'
                      : 'bg-bg-surface/50 border-border-subtle hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm transition-transform"
                      style={{ backgroundColor: item.fill, transform: isHovered ? 'scale(1.25)' : 'scale(1)' }}
                    />
                    <span className={`text-xs font-bold truncate font-outfit ${isHovered ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs font-extrabold text-white font-mono block">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 block">
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
