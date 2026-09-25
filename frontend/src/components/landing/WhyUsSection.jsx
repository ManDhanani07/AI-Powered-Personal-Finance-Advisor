import React from 'react';
import { motion } from 'framer-motion';
import {
  DatabaseZap,
  Globe2,
  Fingerprint,
  Shapes,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SparklesCore } from '../ui/SparklesCore.jsx';

const VALUE_PROPOSITIONS = [
  {
    icon: DatabaseZap,
    title: 'Automated Financial Intelligence',
    subtitle: 'Zero Manual Data Entry Required',
    desc: 'Seamlessly organize transactions, investments, and expenses with instant AI merchant categorization and smart transaction tagging.',
    points: ['Live merchant auto-tagging', 'Real-time transaction alerts', 'Zero manual spreadsheet entry'],
    color: 'text-[#FF5A5F]',
    bgColor: 'bg-[#FF5A5F]/15 border-[#FF5A5F]/20',
    checkColor: 'text-[#FF5A5F]',
  },
  {
    icon: Globe2,
    title: 'Unified Net Worth Aggregation',
    subtitle: 'Everything in One Dark Dashboard',
    desc: 'Get a single, real-time view of your complete net worth across accounts, mutual funds, investments, and savings vaults.',
    points: ['Multi-account balance tracking', 'Net worth growth trajectories', 'Multi-currency support'],
    color: 'text-[#00F2FE]',
    bgColor: 'bg-[#00F2FE]/15 border-[#00F2FE]/20',
    checkColor: 'text-[#00F2FE]',
  },
  {
    icon: Fingerprint,
    title: 'Private 256-Bit AES Encryption',
    subtitle: 'Zero-Knowledge Security',
    desc: 'Secure financial tracking pipelines protected by 256-bit SSL encryption. We never sell or share user data.',
    points: ['Zero bank credentials required', '256-bit AES encryption', 'Zero third-party data sharing'],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15 border-purple-500/20',
    checkColor: 'text-purple-400',
  },
  {
    icon: Shapes,
    title: 'AI Conversational Assistant',
    subtitle: 'Context-Aware Financial Advisory',
    desc: 'Ask natural language questions about your spending, predict next-month expenses, and receive proactive anomaly alerts.',
    points: ['Contextual Q&A on your data', 'Multi-Scale AI expense prediction', 'Proactive burn rate alerts'],
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/20',
    checkColor: 'text-emerald-400',
  },
];

export const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-16 bg-transparent relative overflow-hidden">
      {/* Full-Section Sparkling Star Particles Field (Behind Cards Z-0) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-70">
        <SparklesCore
          id="whyUsSectionSparkles"
          background="transparent"
          minSize={0.5}
          maxSize={1.6}
          particleDensity={220}
          isFullSection={true}
          className="w-full h-full"
          particleColor={["#10B981", "#34D399", "#2DD4BF", "#00F2FE", "#C084FC", "#FFFFFF"]}
          speed={0.6}
        />
      </div>

      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Enterprise-Grade Privacy & Security</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            Built for Privacy, Security & Wealth Growth
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            An ad-free, secure financial operating system built to organize, optimize, and project your net worth.
          </p>
        </motion.div>

        {/* Clean 4 Cards Grid Layout with circular icon styling matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {VALUE_PROPOSITIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-3xl border border-zinc-800 bg-[#09090B] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all space-y-4 flex flex-col justify-between relative z-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${item.bgColor} ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-outfit">
                        {item.title}
                      </h3>
                      <p className={`text-xs font-semibold ${item.color} font-outfit`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {item.desc}
                  </p>

                  <div className="pt-2 space-y-2 border-t border-zinc-800/80">
                    {item.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2 text-xs font-medium text-slate-300">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${item.checkColor} flex-shrink-0`} />
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
