import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Is my banking data safe? Can you move money from my accounts?',
    a: 'Absolutely not. We operate exclusively via Secure Bank Aggregator consent which grants read-only access. We cannot initiate any transfer, payment, or debit from your accounts. All data is encrypted end-to-end with 256-bit AES TLS 1.3 and stored in ISO 27001-certified infrastructure.',
  },
  {
    q: 'Which Indian banks, brokerages, and apps are supported?',
    a: 'We support HDFC Bank, ICICI Bank, SBI, Axis Bank, Kotak Mahindra, Zerodha, Groww, Paytm Money, CRED, and NSDL/CDSL demat accounts via direct open banking APIs.',
  },
  {
    q: 'How does the Prophet ML cash forecasting work?',
    a: 'We use Meta\'s open-source Prophet time-series model trained on your real historical transactions. You can forecast expenses, income, savings, or account balance for 30, 90, 180, or 365 days ahead.',
  },
  {
    q: 'Is this SEBI-registered investment advisory?',
    a: 'No. AI Wealth OS is a financial tracking and organization SaaS — not a SEBI-registered Investment Adviser. All calculations, projections, and AI suggestions are for informational purposes only.',
  },
  {
    q: 'Can I import past transaction history?',
    a: 'Yes. You can import up to 24 months of transaction history via CSV/XLS export from your bank statements, or via automatic AA framework consent sync.',
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
            Everything you need to know about security, bank integrations, and AI capabilities.
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
