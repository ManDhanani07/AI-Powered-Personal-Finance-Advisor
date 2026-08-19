import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Account',
    description: 'Essential money tracking for students and early career professionals.',
    priceMonthlyINR: 0,
    priceAnnualINR: 0,
    priceMonthlyUSD: 0,
    priceAnnualUSD: 0,
    featured: false,
    badge: 'FREE FOREVER',
    features: [
      'Manual & CSV Transaction Logging',
      'Up to 3 Active Budgets',
      'Basic Category Breakdown',
      'Single Currency (INR/USD)',
      'Community Support',
    ],
  },
  {
    id: 'pro',
    name: 'Professional Wealth',
    description: 'Full AI Wealth OS for individuals seeking automated growth & tax optimization.',
    priceMonthlyINR: 299,
    priceAnnualINR: 3000, // ₹250/mo billed annually
    priceMonthlyUSD: 3.99,
    priceAnnualUSD: 35.88, // $2.99/mo billed annually
    featured: true,
    badge: 'MOST POPULAR',
    features: [
      'Full AI Auto Categorization Engine',
      'Bank Account Aggregator Direct Sync',
      'AI Expense Prediction & What-If Simulator',
      'Executive Financial Analytics & Reports',
      'Unlimited Budgets & Savings Goals',
      'AI Risk & Overspending Anomaly Alerts',
      'Multi-Currency Aggregator (INR/USD)',
      'Priority Email & Chat Support',
    ],
  },
  {
    id: 'business',
    name: 'Business Suite & HNIs',
    description: 'Advanced portfolio tracking for high net worth individuals & family hubs.',
    priceMonthlyINR: 799,
    priceAnnualINR: 8000, // ₹667/mo billed annually
    priceMonthlyUSD: 9.99,
    priceAnnualUSD: 95.88, // $7.99/mo billed annually
    featured: false,
    badge: 'UNLIMITED POWER',
    features: [
      'Everything in Pro Wealth Plan',
      'Multi-Entity & Family Wealth Hub',
      'Zerodha, Groww & Crypto API Sync',
      'Export Ledger to Tally & Excel (CA Ready)',
      'Dedicated Wealth Strategist Call',
      '24/7 Priority Support',
    ],
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('ANNUAL'); // 'MONTHLY' | 'ANNUAL'
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'

  return (
    <section id="pricing" className="py-24 bg-transparent relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-emerald-500/5 blur-[220px]" />

      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-zinc-800 text-slate-300 text-xs font-semibold tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transparent Wealth Investment</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-outfit">
            Predictable Plans for Every Stage
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-medium">
            Start for free, then scale as your financial portfolio grows. No hidden fees or lock-in contracts.
          </p>

          {/* Toggle Switches */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {/* Billing Cycle Switch */}
            <div className="flex items-center bg-[#141418] p-1.5 rounded-xl border border-zinc-800">
              <button
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-[#09090B] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Annual <span className="text-emerald-400 text-[10px] ml-1 font-extrabold">(Save 17%)</span>
              </button>
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#09090B] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Currency Switch */}
            <div className="flex items-center bg-[#141418] p-1.5 rounded-xl border border-zinc-800">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  currency === 'INR'
                    ? 'bg-[#09090B] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-[#09090B] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3 Plan Cards (CORNER CARDS PROMINENTLY TILTED INWARD, CENTER CARD STRAIGHT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => {
            let displayPrice = '';
            if (currency === 'INR') {
              const price = billingCycle === 'ANNUAL' ? Math.round(plan.priceAnnualINR / 12) : plan.priceMonthlyINR;
              displayPrice = price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
            } else {
              const price = billingCycle === 'ANNUAL' ? (plan.priceAnnualUSD / 12).toFixed(2) : plan.priceMonthlyUSD.toFixed(2);
              displayPrice = price === '0.00' || price === '0' ? '$0' : `$${price}`;
            }

            // Explicit Tilt Styles for Corner Cards (bypassing motion transform overwrite)
            let cardTransform = 'none';
            let cardOrigin = 'center center';
            let extraClasses = '';

            if (idx === 0) {
              // Left Corner Card: Tilted inward right (+4.5deg)
              cardTransform = 'rotate(4.5deg) scale(0.96)';
              cardOrigin = 'right center';
              extraClasses = 'hover:[transform:rotate(0deg)_scale(1)]';
            } else if (idx === 2) {
              // Right Corner Card: Tilted inward left (-4.5deg)
              cardTransform = 'rotate(-4.5deg) scale(0.96)';
              cardOrigin = 'left center';
              extraClasses = 'hover:[transform:rotate(0deg)_scale(1)]';
            } else {
              // Center Card: Straight in center as-is
              cardTransform = 'none';
              extraClasses = 'z-10 md:scale-105';
            }

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="h-full flex"
              >
                <div
                  style={{ transform: cardTransform, transformOrigin: cardOrigin }}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-500 bg-[#09090B] w-full ${extraClasses} ${
                    plan.featured
                      ? 'border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
                      : 'border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  {/* Featured Badge */}
                  {plan.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight font-outfit">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 min-h-[36px]">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl font-black text-white tracking-tight font-outfit">
                        {displayPrice}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">
                        / month {billingCycle === 'ANNUAL' && plan.priceMonthlyINR > 0 ? '(billed annually)' : ''}
                      </span>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start text-xs font-semibold text-slate-300">
                          <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mr-2.5 mt-0.5 flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Plan CTA */}
                  <button
                    onClick={() => navigate(`/register?plan=${plan.id}`)}
                    className={`mt-8 w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      plan.featured
                        ? 'bg-white hover:bg-slate-100 text-slate-950 font-bold shadow-md'
                        : 'bg-[#141418] text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    {plan.priceMonthlyINR === 0 ? 'Get Started Free' : 'Start 14-Day Free Trial'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
