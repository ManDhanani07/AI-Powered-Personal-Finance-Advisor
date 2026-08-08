import React, { useState } from 'react';
import { Store, CreditCard, ArrowUpRight, ShoppingBag } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, hoveredBarIndex }) => {
  if (!active || !payload?.length || hoveredBarIndex === null || hoveredBarIndex === undefined) return null;
  const d = payload[0];
  return (
    <div className="rounded-2xl border border-border-strong bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl text-xs text-white min-w-[150px]">
      <p className="font-bold text-slate-300 mb-1 font-outfit">{d.payload.payment_method}</p>
      <p className="font-extrabold text-white font-mono text-xs">
        Total Spent : <span className="text-emerald-400">{formatINR(d.value)}</span>
      </p>
    </div>
  );
};

export const MerchantIntelligence = ({ merchants = [], paymentMethods = [] }) => {
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  return (
    <div className="w-full">
      {/* Payment Method Distribution */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Payment Instrument Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Channel Analytics</span>
        </div>

        <div className="h-64 w-full pt-2">
          {(() => {
            const chartData = paymentMethods.length > 0 ? paymentMethods : [
              { payment_method: 'UPI', total_amount: 150000 },
              { payment_method: 'DEBIT_CARD', total_amount: 85000 },
              { payment_method: 'CREDIT_CARD', total_amount: 45000 },
              { payment_method: 'BANK_TRANSFER', total_amount: 30000 },
            ];

            return (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="payment_method" stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    cursor={false}
                    content={<CustomTooltip hoveredBarIndex={hoveredBarIndex} />}
                  />
                  <Bar dataKey="total_amount" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default MerchantIntelligence;
