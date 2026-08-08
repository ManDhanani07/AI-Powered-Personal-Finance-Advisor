import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Globe,
  Calculator,
  Bot,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';

const VALUE_PROPOSITIONS = [
  {
    icon: Zap,
    title: 'Automated Financial Intelligence',
    subtitle: 'Zero Manual Entry Required',
    desc: 'Seamlessly sync bank accounts, investments, and expenses with instant AI regex merchant categorization and live transaction tagging.',
    color: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-400',
    badge: 'Automated Sync',
    points: ['Live merchant auto-tagging', 'Real-time transaction alerts', 'Zero manual spreadsheet entry'],
  },
  {
    icon: Globe,
    title: 'Unified Wealth Aggregation',
    subtitle: 'Everything in One Dashboard',
    desc: 'Get a single, real-time view of your complete net worth across bank accounts, mutual funds, stocks, and savings vaults.',
    color: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-400',
    badge: 'Consolidated Hub',
    points: ['Cross-bank balance tracking', 'Net worth growth trajectories', 'Multi-currency support'],
  },
  {
    icon: Calculator,
    title: 'Smart Tax Strategy Engine',
    subtitle: 'Maximize Annual Savings',
    desc: 'Analyze spending patterns, compare income vs expense trends, and uncover actionable savings opportunities with AI-driven recommendations.',
    color: 'from-purple-500 to-indigo-600',
    iconColor: 'text-purple-400',
    badge: 'Tax Optimization',
    points: ['Income vs Expense analytics', 'Spending pattern insights', '1-click PDF export reports'],
  },
  {
    icon: Bot,
    title: 'AI Personal Copilot',
    subtitle: 'Conversational Financial Assistant',
    desc: 'Ask natural language questions about your spending, forecast 12-month cash flows, and receive proactive anomaly alerts.',
    color: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-400',
    badge: 'AI Assistant',
    points: ['Contextual Q&A on your data', 'Prophet ML cash forecasting', 'Proactive burn rate alerts'],
  },
];

export const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-20 bg-bg-base relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[140px]" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Core Advantages"
          badgeIcon={Sparkles}
          title="Designed for Modern"
          highlightText="Wealth Management"
          subtitle="Experience an intelligent, ad-free financial OS built to organize, optimize, and grow your net worth."
          className="mb-12"
        />

        {/* Clean 4 Positive Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {VALUE_PROPOSITIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-border-subtle bg-bg-surface p-7 shadow-glass space-y-5 hover:border-primary-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-bg-elevated text-slate-300 border border-border-subtle font-outfit">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-xl font-extrabold text-white font-outfit leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-primary-400 mt-0.5 font-outfit">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 font-normal leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Key Points Checklist */}
                  <div className="pt-2 space-y-2 border-t border-border-subtle">
                    {item.points.map((pt, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
