import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, CreditCard, Building2, Zap, Landmark } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Bank Account Aggregator', badge: 'Secure Licensed', icon: ShieldCheck, color: 'text-[#FF5A5F]' },
  { name: 'Zerodha Kite API', badge: 'Stocks & Portfolio', icon: TrendingUp, color: 'text-[#00F2FE]' },
  { name: 'HDFC Bank Sync', badge: 'Direct Open Banking', icon: Landmark, color: 'text-purple-400' },
  { name: 'CRED Financial', badge: 'Credit Card Sync', icon: CreditCard, color: 'text-rose-400' },
  { name: 'Stripe India', badge: 'Payment Gateway', icon: Zap, color: 'text-emerald-400' },
  { name: 'ICICI iMobile', badge: 'Banking API', icon: Building2, color: 'text-[#00F2FE]' },
  { name: 'Groww Mutual Funds', badge: 'Portfolio Sync', icon: TrendingUp, color: 'text-[#FF5A5F]' },
];

export const SocialProofMarquee = () => {
  const marqueeItems = [...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="py-6 bg-transparent overflow-hidden"
    >
      <div className="max-w-screen-xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Seamless Direct Bank Integrations & Bank-Grade Security
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Gradient Fades for edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#000000] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#000000] to-transparent z-10" />

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
                className="inline-flex items-center space-x-3 px-5 py-3 rounded-2xl bg-[#09090B] border border-zinc-800 shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex-shrink-0"
              >
                <div className={`p-2 rounded-xl bg-[#141418] ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.badge}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SocialProofMarquee;
