import React, { memo, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import { formatCompactFinancial, formatCurrency } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

// 3D Donut Beveled Color Palette matching reference image
const SEGMENT_COLORS = [
  '#EA580C', // Burnt Orange
  '#F59E0B', // Golden Amber
  '#E11D48', // Crimson Coral
  '#0D9488', // Deep Teal
  '#10B981', // Vibrant Emerald
  '#3F3F46', // Charcoal Slate
  '#71717A', // Muted Grey
  '#6366F1', // Indigo Accent
];

export const CategoryChart = memo(({ charts, loading, onSeeded }) => {
  const [viewMode, setViewMode] = useState('pie'); // 'pie' | 'radial'
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
  const totalValue = raw.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  const data = raw.map((d, i) => ({
    name: d.category_name,
    value: Number(d.value ?? 0),
    percentage: Number(d.percentage ?? 0),
    fill: d.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <span>Category Spending</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              3D Donut
            </span>
          </h3>
          <p className="text-xs text-slate-400">Expense distribution across category envelopes</p>
        </div>

        {data.length > 0 && (
          <div className="flex bg-[#121216] border border-zinc-800 rounded-xl p-1 gap-1">
            {['pie', 'radial'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-md'
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
          <div className="md:col-span-7 relative flex items-center justify-center py-2">
            <ResponsiveContainer width="100%" height={260}>
              {viewMode === 'pie' ? (
                <PieChart>
                  <defs>
                    <filter id="donut3dBevel" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.75" />
                    </filter>
                  </defs>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={112}
                    paddingAngle={4}
                    cornerRadius={4}
                    minAngle={12}
                    dataKey="value"
                    filter="url(#donut3dBevel)"
                    animationDuration={1200}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.fill}
                        stroke="#09090B"
                        strokeWidth={3}
                        style={{
                          transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center center',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          filter: activeIndex === i ? 'brightness(1.2)' : 'none',
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
                    animationDuration={1200}
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

            {/* Dynamic Interactive 3D Donut Center Lens matching User Image */}
            {viewMode === 'pie' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <div className="w-[126px] h-[126px] rounded-full bg-[#09090B] border border-zinc-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-2">
                  {activeItem ? (
                    <>
                      <span className="text-xl font-black text-white font-outfit tracking-tight leading-none">
                        {activeItem.percentage.toFixed(0)}%
                      </span>
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider truncate max-w-[100px] mt-1"
                        style={{ color: activeItem.fill }}
                      >
                        {activeItem.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 mt-0.5">
                        {formatCurrency(activeItem.value)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-white font-outfit tracking-tight leading-none">
                        100%
                      </span>
                      <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider font-outfit">
                        Total
                      </span>
                      <span className="text-[10px] font-mono text-slate-300 mt-0.5 font-semibold">
                        {formatCompactFinancial(totalValue)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clean Interactive Legend List */}
          <div className="md:col-span-5 space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {data.map((item, idx) => {
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-[#121216] border-zinc-700 shadow-md scale-[1.02]'
                      : 'bg-[#09090B] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm transition-transform"
                      style={{ backgroundColor: item.fill, transform: isHovered ? 'scale(1.25)' : 'scale(1)' }}
                    />
                    <span className={`text-xs font-bold truncate font-outfit ${isHovered ? 'text-white font-extrabold' : 'text-slate-300'}`}>
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
