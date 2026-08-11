import React, { memo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { RotateCw } from 'lucide-react';
import { formatCompactFinancial, formatCurrency } from '../../utils/formatters.js';
import EmptyLedgerCallout from './EmptyLedgerCallout.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const net = Number(payload[0]?.value ?? 0);
  const isPositive = net >= 0;
  return (
    <div className="rounded-2xl border border-border-strong bg-bg-surface/95 backdrop-blur-xl shadow-2xl p-3.5 text-xs min-w-[160px]">
      <p className="font-bold text-white font-outfit border-b border-border-subtle pb-1.5 mb-2">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full inline-block shadow-sm ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className="text-slate-300 font-medium">Net Surplus:</span>
        </div>
        <span className={`font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatCurrency(net)}
        </span>
      </div>
    </div>
  );
};

const CustomLiveDot = (props) => {
  const { cx, cy, index, dataLength, strokeColor } = props;
  const isLatest = index === dataLength - 1;

  if (cx === undefined || cy === undefined) return null;

  return (
    <g key={`dot-${index}`}>
      {isLatest && (
        <circle cx={cx} cy={cy} r={10} fill={strokeColor} opacity={0.35} className="animate-ping" />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isLatest ? 5.5 : 3.5}
        fill={isLatest ? '#FFFFFF' : strokeColor}
        stroke={isLatest ? strokeColor : '#1E293B'}
        strokeWidth={isLatest ? 3 : 2}
      />
    </g>
  );
};

const SkeletonChart = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-5 bg-slate-800 rounded w-1/3" />
    <div className="h-60 bg-slate-800/60 rounded-2xl" />
  </div>
);

export const CashFlowChart = memo(({ charts, loading, onSeeded }) => {
  const [animKey, setAnimKey] = useState(0);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Continuous infinite stream loop — auto-reanimates trajectory every 4.5s
  React.useEffect(() => {
    if (!isLiveStreaming) return;
    const timer = setInterval(() => {
      setAnimKey((k) => k + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [isLiveStreaming]);

  if (loading) return <SkeletonChart />;

  const rawData = charts?.cash_flow_monthly || [];
  const data = rawData.map((d) => {
    const rawMonth = d.month || '';
    const parts = rawMonth.split(' ');
    const shortLabel = parts.length === 2 ? `${parts[0]} '${parts[1].slice(2)}` : rawMonth;

    return {
      month: shortLabel,
      fullMonth: rawMonth,
      Net: Number(d.net ?? 0),
    };
  });

  const hasData = data.some((d) => Math.abs(d.Net) > 0);
  const fillColor = '#10B981';
  const strokeColor = '#34D399';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
            <span>Monthly Net Savings & Surplus</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{isLiveStreaming ? 'Streaming 24/7' : 'Paused'}</span>
            </div>
          </h3>
          <p className="text-xs text-slate-400">Net monthly savings and financial surplus continuous timeline</p>
        </div>

        {hasData && (
          <button
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${
              isLiveStreaming
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-800 border-border-subtle text-slate-400 hover:text-white'
            }`}
            title="Toggle continuous live stream looping"
          >
            <RotateCw className={`h-3 w-3 ${isLiveStreaming ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span>{isLiveStreaming ? 'Live Stream ON' : 'Paused'}</span>
          </button>
        )}
      </div>

      {!hasData ? (
        <EmptyLedgerCallout title="Monthly Cash Flow Graph Empty" onSeeded={onSeeded} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart key={animKey} data={data} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
            <defs>
              <linearGradient id="cashFlowGrad3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity={0.45} />
                <stop offset="50%" stopColor={fillColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>

              <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={strokeColor} floodOpacity="0.6" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              angle={-25}
              textAnchor="end"
              height={45}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCompactFinancial(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Net"
              stroke={strokeColor}
              strokeWidth={3}
              fill="url(#cashFlowGrad3D)"
              filter="url(#glowLine)"
              isAnimationActive={true}
              animationDuration={2200}
              animationEasing="ease-in-out"
              dot={(dotProps) => (
                <CustomLiveDot
                  {...dotProps}
                  dataLength={data.length}
                  strokeColor={strokeColor}
                />
              )}
              activeDot={{ r: 7, strokeWidth: 3, stroke: '#FFFFFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

CashFlowChart.displayName = 'CashFlowChart';
export default CashFlowChart;
