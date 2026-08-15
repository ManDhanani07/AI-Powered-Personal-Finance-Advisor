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
    <div className="rounded-2xl border border-zinc-800 bg-[#09090B]/95 backdrop-blur-xl shadow-2xl p-3.5 text-xs min-w-[160px] font-sans">
      <p className="font-bold text-white font-outfit border-b border-zinc-800/80 pb-1.5 mb-2">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full inline-block shadow-sm ${isPositive ? 'bg-purple-400' : 'bg-rose-400'}`} />
          <span className="text-slate-300 font-medium">Net Surplus:</span>
        </div>
        <span className={`font-bold font-mono ${isPositive ? 'text-purple-400' : 'text-rose-400'}`}>
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
        stroke={isLatest ? strokeColor : '#12131A'}
        strokeWidth={isLatest ? 3 : 2}
      />
    </g>
  );
};

const SkeletonChart = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-5 bg-zinc-800 rounded w-1/3" />
    <div className="h-60 bg-zinc-800/60 rounded-2xl" />
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
  const monthMap = {
    jan: '1 Jan',
    feb: '1 Feb',
    mar: '1 Mar',
    apr: '1 Apr',
    may: '1 May',
    jun: '1 Jun',
    jul: '1 Jul',
    aug: '1 Aug',
    sep: '1 Sep',
    oct: '1 Oct',
    nov: '1 Nov',
    dec: '1 Dec',
  };

  const data = rawData.map((d) => {
    const rawMonth = d.month || '';
    const prefix = rawMonth.trim().slice(0, 3).toLowerCase();
    const displayLabel = monthMap[prefix] || rawMonth;

    return {
      month: displayLabel,
      fullMonth: rawMonth,
      Net: Number(d.net ?? 0),
    };
  });

  const hasData = data.some((d) => Math.abs(d.Net) > 0);
  const fillColor = '#A855F7';
  const strokeColor = '#C084FC';

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-outfit">
            Monthly Net Savings & Surplus
          </h3>
          <p className="text-xs text-slate-400">Net monthly savings and financial surplus continuous timeline</p>
        </div>

        {hasData && (
          <button
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold font-outfit transition-all shadow-sm active:scale-95 cursor-pointer ${
              isLiveStreaming
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 hover:bg-purple-500/20'
                : 'bg-zinc-800 border-zinc-700 text-slate-400 hover:text-white'
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
          <AreaChart key={animKey} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <defs>
              <linearGradient id="cashFlowGradPurePurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#A855F7" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>

              <filter id="glowPurpleLine" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#C084FC" floodOpacity={0.65} />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              angle={-25}
              textAnchor="end"
              height={45}
              padding={{ left: 12, right: 12 }}
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
              fill="url(#cashFlowGradPurePurple)"
              filter="url(#glowPurpleLine)"
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
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#4c1d95', fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

CashFlowChart.displayName = 'CashFlowChart';
export default CashFlowChart;
