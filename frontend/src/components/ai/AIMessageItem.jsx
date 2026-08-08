import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, ArrowRight, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';

export const AIMessageItem = ({ message, onExecuteCTA }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end my-3"
      >
        <div className="max-w-md rounded-3xl rounded-tr-sm bg-gradient-to-r from-primary-500 to-indigo-600 p-4 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 leading-relaxed">
          {message.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start space-x-3 my-4 max-w-3xl"
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      {/* AI Response Card Container */}
      <div className="flex-1 space-y-4 rounded-3xl border border-border-subtle bg-bg-surface p-5 shadow-glass text-xs leading-relaxed text-slate-800 dark:text-slate-200">
        {/* Main Text Content */}
        <div className="space-y-2">
          {message.text.split('\n').map((line, idx) => (
            <p key={idx} className={line.startsWith('•') ? 'pl-2 text-slate-300' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* Inline Metric Card Render if present */}
        {message.inlineMetric && (
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-border-strong bg-bg-elevated/60">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">{message.inlineMetric.label1}</p>
              <p className="text-base font-black text-emerald-400 font-outfit">{message.inlineMetric.val1}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">{message.inlineMetric.label2}</p>
              <p className="text-base font-black text-primary-400 font-outfit">{message.inlineMetric.val2}</p>
            </div>
          </div>
        )}

        {/* Inline Recharts Mini-Chart if present */}
        {message.chartData && (
          <div className="p-4 rounded-2xl border border-border-strong bg-bg-elevated/60 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Visual Breakdown</p>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={message.chartData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F141C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Embedded Interactive Action CTA Chips */}
        {message.ctaActions && message.ctaActions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
            <span className="text-[11px] font-bold text-slate-400">Quick Actions:</span>
            {message.ctaActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onExecuteCTA(action)}
                className="px-3.5 py-1.5 rounded-xl border border-primary-500/30 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 font-bold text-xs transition-all flex items-center space-x-1.5 hover:scale-105 active:scale-95"
              >
                <span>{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIMessageItem;
