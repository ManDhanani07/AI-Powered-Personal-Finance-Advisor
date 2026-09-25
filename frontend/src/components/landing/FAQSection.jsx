import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Is my financial data safe? Can you access my bank account?',
    a: 'We never connect directly to your bank or ask for bank login credentials. We do not have any ability to access, withdraw, or move your funds. You track your finances safely by logging transactions or importing your own CSV statements. All stored records are protected with industry-standard 256-bit AES encryption.',
  },
  {
    q: 'How do I add and track my transactions?',
    a: 'You can easily log transactions manually in seconds, or import standard CSV/Excel statement files exported from any financial institution, mobile wallet, or credit card portal.',
  },
  {
    q: 'How does the AI Expense Prediction Engine work?',
    a: 'Our multi-scale adaptive engine decomposes your spending into Fixed Contractual, Essential Routine, and Elastic Discretionary tiers. It combines adaptive exponential moving averages with gradient-boosted residual regressors to generate realistic P10–P90 quantile forecast intervals and safe budget ceilings based on your real transaction history.',
  },
  {
    q: 'How does the Financial Health Score work?',
    a: 'Our rule-based financial health engine calculates a composite score (0-100) and letter grade (A+ to F) evaluating your savings rate, budget discipline, emergency buffer, and spending concentration.',
  },
  {
    q: 'Is this SEBI-registered investment advisory?',
    a: 'No. AI Wealth OS is a financial tracking and organization SaaS — not a SEBI-registered Investment Adviser. All calculations, projections, and AI suggestions are for informational purposes only.',
  },
  {
    q: 'Can I import past transaction history?',
    a: 'Yes. You can import your past transaction history using our CSV importer. Simply export a CSV or Excel statement from your accounts and upload it directly into your ledger.',
  },
  {
    q: 'What does the Gemini AI Wealth Copilot actually do?',
    a: 'The AI Copilot is a conversational assistant powered by Google Gemini 1.5 Pro that answers natural language questions about your finances — "How much did I spend on food last month?", "What is my net worth trend?", "How can I optimize my category budgets?".',
  },
];

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="faq" className="py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-[#FF5A5F]/20 text-[#FF5A5F] text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#FF5A5F]" />
            <span>Clear Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Everything you need to know about security, statement imports, and AI capabilities.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-2xl border border-zinc-800 bg-[#09090B] shadow-[0_10px_30px_rgba(0,0,0,0.85)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-white font-outfit pr-4 leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-indigo-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed font-normal border-t border-zinc-800/80 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
