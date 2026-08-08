import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';

const FAQS = [
  {
    q: 'Is my banking data safe? Can you move money from my accounts?',
    a: 'Absolutely not. We operate exclusively via Secure Bank Aggregator consent which grants read-only access. We cannot initiate any transfer, payment, or debit from your accounts. All data is encrypted end-to-end with 256-bit AES TLS 1.3 and stored in ISO 27001-certified infrastructure.',
  },
  {
    q: 'Which Indian banks, brokerages, and apps are supported?',
    a: 'We support HDFC Bank, ICICI Bank, SBI, Axis Bank, Kotak Mahindra, Zerodha, Groww, Paytm Money, CRED, and NSDL/CDSL demat accounts via direct open banking APIs. New integrations are added automatically every quarter.',
  },
  {
    q: 'How does the Prophet ML cash forecasting work?',
    a: 'We use Meta\'s open-source Prophet time-series model trained on your real historical transactions. You can forecast expenses, income, savings, or account balance for 30, 90, 180, or 365 days ahead. The engine automatically detects seasonality and trend shifts from your data.',
  },
  {
    q: 'Is this SEBI-registered investment advisory?',
    a: 'No. AI Wealth OS is a financial tracking and organization SaaS — not a SEBI-registered Investment Adviser. All calculations, projections, and AI suggestions are for informational purposes only and should not be construed as investment advice. Please consult a registered RIA for personalized investment decisions.',
  },
  {
    q: 'Can I import past transaction history?',
    a: 'Yes. You can import up to 24 months of transaction history via CSV/XLS export from your bank statements, or via automatic AA framework consent sync. Manual categorization rules apply automatically once your rule engine is configured.',
  },
  {
    q: 'What does the AI Wealth Copilot actually do?',
    a: 'The AI Copilot is a conversational assistant powered by GPT-4o that answers natural language questions about your finances — "How much did I spend on food last month?", "What is my net worth trend?", "Which SIP would save me the most tax?". It can also take inline actions like creating goal vaults or adjusting budget envelopes.',
  },
  {
    q: 'Is there a free plan? What are the limitations?',
    a: 'Yes! The Free plan includes 1 bank connection, 500 transaction history, basic categorization, and limited AI queries per month. The Pro plan unlocks unlimited bank connections, advanced tax strategy engine, AI Copilot, cash flow forecasting, and PDF exports.',
  },
];

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="faq" className="py-24 bg-bg-base border-t border-border-subtle relative overflow-hidden">
      {/* Background Orb */}
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Clear Answers"
          badgeIcon={HelpCircle}
          title="Frequently Asked"
          highlightText="Questions"
          subtitle="Everything you need to know about security, bank integrations, tax optimization, and AI capabilities."
          className="mb-14"
        />

        {/* FAQ Accordion */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                    : 'border-border-subtle bg-bg-surface hover:border-border-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-outfit pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary-400' : ''
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
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal border-t border-border-subtle pt-3">
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
