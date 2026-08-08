import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

const PLANS = [
  {
    id: 'starter',
    name: 'Student & Starter',
    description: 'Essential money tracking for students and early career professionals.',
    priceMonthlyINR: 0,
    priceAnnualINR: 0,
    priceMonthlyUSD: 0,
    priceAnnualUSD: 0,
    features: [
      'Manual & CSV Transaction Logging',
      'Up to 3 Active Budgets',
      'Basic Category Breakdown',
      'Single Currency (INR/USD)',
      'Community Support',
    ],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Professional Wealth',
    description: 'Full AI Wealth OS for individuals seeking automated growth & tax optimization.',
    priceMonthlyINR: 299,
    priceAnnualINR: 2999, // ~20% discount
    priceMonthlyUSD: 4.99,
    priceAnnualUSD: 49.99,
    features: [
      'Full AI Auto Categorization Engine',
      'Bank Account Aggregator Direct Sync',
      'Prophet ML 12-Month Cash Forecasting',
      'Unlimited Budgets & Savings Goals',
      'AI Risk & Overspending Anomaly Alerts',
      'Multi-Currency Aggregator (INR/USD)',
      'Priority Email & Chat Support',
    ],
    cta: 'Start 14-Day Free Trial',
    featured: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'business',
    name: 'Business Suite & HNIs',
    description: 'Advanced portfolio tracking for high net worth individuals & family hubs.',
    priceMonthlyINR: 799,
    priceAnnualINR: 7999,
    priceMonthlyUSD: 12.99,
    priceAnnualUSD: 129.99,
    features: [
      'Everything in Pro Wealth Plan',
      'Multi-Entity & Family Wealth Hub',
      'Zerodha, Groww & Crypto API Sync',
      'Export Ledger to Tally & Excel (CA Ready)',
      'Dedicated Wealth Strategist Call',
      '24/7 Priority Support',
    ],
    cta: 'Contact Wealth Team',
    featured: false,
  },
];

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('ANNUAL'); // 'MONTHLY' | 'ANNUAL'
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-bg-surface relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
            Invest in Your Financial Freedom
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Choose the plan that fits your wealth journey. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Dynamic Controls: Billing Cycle + Currency Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Monthly / Annual Toggle */}
          <div className="flex items-center bg-bg-elevated p-1.5 rounded-2xl border border-border-strong shadow-sm">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-bg-surface text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'ANNUAL'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-bg-elevated p-1.5 rounded-2xl border border-border-strong shadow-sm">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currency === 'INR'
                  ? 'bg-bg-surface text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-bg-surface text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            let displayPrice = '';
            if (currency === 'INR') {
              const price = billingCycle === 'ANNUAL' ? Math.round(plan.priceAnnualINR / 12) : plan.priceMonthlyINR;
              displayPrice = price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
            } else {
              const price = billingCycle === 'ANNUAL' ? (plan.priceAnnualUSD / 12).toFixed(2) : plan.priceMonthlyUSD.toFixed(2);
              displayPrice = price === '0.00' || price === '0' ? '$0' : `$${price}`;
            }

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.featured
                    ? 'bg-bg-surface border-2 border-primary-500 shadow-2xl shadow-primary-500/20 md:-translate-y-2'
                    : 'bg-bg-surface border border-border-strong shadow-xl'
                }`}
              >
                {/* Featured Badge */}
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-outfit">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold ml-1.5">
                      / month {billingCycle === 'ANNUAL' && plan.priceMonthlyINR > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500 mr-2.5 mt-0.5 flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan CTA */}
                <button
                  onClick={() => navigate(`${ROUTES.AUTH.REGISTER}?plan=${plan.id}`)}
                  className={`mt-8 w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                    plan.featured
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-bg-elevated text-slate-900 dark:text-white border border-border-strong hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
