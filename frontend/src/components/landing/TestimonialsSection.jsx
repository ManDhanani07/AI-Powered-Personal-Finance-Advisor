import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Arjun Mehta',
    role: 'Senior Software Engineer',
    location: 'Bangalore',
    avatar: 'AM',
    rating: 5,
    quote: 'Finally replaced 4 different apps — CRED, Zerodha console, Excel sheets — with one platform. The AI Copilot answered my spending questions instantly, and the Prophet forecast helped me plan my home down payment.',
    highlight: 'All-in-one financial OS',
    gradient: 'from-primary-500 to-blue-600',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Product Manager',
    location: 'Mumbai',
    avatar: 'PS',
    rating: 5,
    quote: 'The AI Copilot is scary smart. I asked "Am I on track for my home down payment?" and it gave me a complete breakdown with adjusted savings targets and an investment allocation plan in 3 seconds.',
    highlight: 'Instant AI Wealth Strategy',
    gradient: 'from-accent-500 to-teal-600',
  },
  {
    id: 3,
    name: 'Rahul Verma',
    role: 'Freelance Design Director',
    location: 'Delhi NCR',
    avatar: 'RV',
    rating: 5,
    quote: 'As a freelancer with variable monthly income, the Cash Flow Forecast is a lifesaver. It projects my next 12 months and warns me of potential cash shortfalls 3 months in advance.',
    highlight: '12-Month Monte Carlo Forecast',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'Consulting Doctor',
    location: 'Ahmedabad',
    avatar: 'SP',
    rating: 5,
    quote: 'The Old vs New Tax Regime comparison paid for 5 years of Pro subscription in the first month. Switched to New Regime Sec 115BAC and my effective tax rate dropped by 18%.',
    highlight: '18% Effective Tax Reduction',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 5,
    name: 'Kiran Reddy',
    role: 'Tech Startup Founder',
    location: 'Hyderabad',
    avatar: 'KR',
    rating: 5,
    quote: 'The envelope budgeting grid keeps my startup burn rate and personal finances completely separated. The AI burn rate warnings hit before I even notice I am overspending.',
    highlight: 'Zero-Based Envelope Grid',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 6,
    name: 'Ananya Krishnan',
    role: 'Financial Analyst',
    location: 'Chennai',
    avatar: 'AK',
    rating: 5,
    quote: 'The merchant dependency matrix in reports showed I was spending ₹28,000/month on food delivery. Cut it down to ₹8,000 and routed the ₹20,000 surplus straight into index fund vaults.',
    highlight: '₹20,000 Monthly Savings Rerouted',
    gradient: 'from-sky-500 to-blue-600',
  },
];

export const TestimonialsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const nextTestimonial = () => {
    setActiveTab((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTab((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-bg-surface/60 border-t border-border-subtle relative overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute top-1/3 left-10 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Verified Success Stories"
          badgeIcon={Star}
          title="Loved by 50,000+ Smart Investors Across"
          highlightText="India"
          subtitle="From software engineers and freelancers to doctors and founders — see how AI Wealth OS changes lives."
          className="mb-16"
        />

        {/* 6 Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-border-subtle bg-bg-surface p-7 shadow-glass flex flex-col justify-between space-y-5 hover:border-primary-500/40 hover:shadow-2xl transition-all duration-300 relative group"
            >
              {/* Quote Icon Background */}
              <Quote className="w-10 h-10 text-primary-500/10 absolute top-5 right-5 group-hover:text-primary-500/20 transition-colors" />

              <div className="space-y-4 relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-400 ml-2 font-mono">5.0</span>
                </div>

                {/* Quote text */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-3 relative z-10">
                {/* Highlight Badge */}
                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${t.gradient} text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.highlight}</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${t.gradient} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-outfit leading-tight">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {t.role} · {t.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
