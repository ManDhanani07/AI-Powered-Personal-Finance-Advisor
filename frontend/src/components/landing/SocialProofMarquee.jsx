import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, CreditCard, Building2, Zap, Landmark } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Bank Account Aggregator', badge: 'Secure Licensed', icon: ShieldCheck, color: 'text-emerald-500' },
  { name: 'Zerodha Kite API', badge: 'Stocks & F&O', icon: TrendingUp, color: 'text-sky-500' },
  { name: 'HDFC Bank Sync', badge: 'Direct Open Banking', icon: Landmark, color: 'text-indigo-500' },
  { name: 'CRED Financial', badge: 'Credit Card Sync', icon: CreditCard, color: 'text-amber-500' },
  { name: 'Stripe India', badge: 'Payment Gateway', icon: Zap, color: 'text-purple-500' },
  { name: 'ICICI iMobile', badge: 'Banking API', icon: Building2, color: 'text-rose-500' },
  { name: 'Groww Mutual Funds', badge: 'Portfolio Sync', icon: TrendingUp, color: 'text-teal-500' },
];

export const SocialProofMarquee = () => {
  const marqueeItems = [...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <section className="py-12 border-y border-border-subtle bg-bg-surface/50 backdrop-blur-md overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Seamless Direct Integrations & Bank-Grade Security
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Gradient Fades for edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-base to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-base to-transparent z-10" />

        {/* Marquee Track */}
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
          className="flex space-x-6 whitespace-nowrap"
        >
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="inline-flex items-center space-x-3 px-5 py-3 rounded-2xl border border-border-subtle bg-bg-elevated/80 shadow-sm flex-shrink-0"
              >
                <div className={`p-2 rounded-xl bg-bg-surface ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.badge}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofMarquee;
