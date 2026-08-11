import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Arjun Mehta',
    role: 'Senior Software Engineer',
    location: 'Bangalore',
    avatar: 'AM',
    rating: 5,
    quote: 'Finally replaced scattered tracking tools with one platform. The AI Copilot answered my spending questions instantly, and the Prophet forecast helped me plan my home down payment.',
    highlight: 'All-in-one financial OS',
    avatarGradient: 'from-indigo-600 to-purple-600',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Product Manager',
    location: 'Mumbai',
    avatar: 'PS',
    rating: 5,
    quote: 'The AI Copilot is incredibly smart. I asked "Am I on track for my savings target?" and it gave me a complete breakdown with adjusted savings goals in 3 seconds.',
    highlight: 'Instant AI Wealth Strategy',
    avatarGradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 3,
    name: 'Rahul Verma',
    role: 'Design Director',
    location: 'Delhi NCR',
    avatar: 'RV',
    rating: 5,
    quote: 'As a freelancer with variable monthly income, the Cash Flow Forecast is essential. It projects my next 12 months and alerts me to potential cash shortfalls.',
    highlight: '12-Month Prophet Forecast',
    avatarGradient: 'from-cyan-500 to-blue-600',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'Consulting Doctor',
    location: 'Ahmedabad',
    avatar: 'SP',
    rating: 5,
    quote: 'The executive financial summary paid for 5 years of Pro subscription in the first month. Clear category spending breakdowns helped me reroute surplus savings.',
    highlight: 'Executive Financial Digest',
    avatarGradient: 'from-purple-500 to-pink-600',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 5,
    name: 'Kiran Reddy',
    role: 'Tech Startup Founder',
    location: 'Hyderabad',
    avatar: 'KR',
    rating: 5,
    quote: 'The envelope budgeting grid keeps my startup burn rate and personal finances completely separated. The AI burn rate warnings hit before I even notice I am overspending.',
    highlight: 'Envelope Budgeting Grid',
    avatarGradient: 'from-rose-500 to-red-600',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 6,
    name: 'Ananya Krishnan',
    role: 'Financial Analyst',
    location: 'Chennai',
    avatar: 'AK',
    rating: 5,
    quote: 'The category breakdown showed I was spending ₹28,000/month on food delivery. Cut it down to ₹8,000 and routed the ₹20,000 surplus straight into savings goals.',
    highlight: '₹20,000 Monthly Savings Rerouted',
    avatarGradient: 'from-amber-500 to-orange-600',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Verified Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            Loved by 50,000+ Smart Investors Across India
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            From software engineers and freelancers to doctors and founders — see how AI Wealth OS changes lives.
          </p>
        </motion.div>

        {/* 6 Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="rounded-3xl border border-zinc-800 bg-[#09090B] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all flex flex-col justify-between space-y-5 relative group"
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal italic">
                  "{t.quote}"
                </p>

                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${t.badgeColor}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.highlight}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center space-x-3.5 relative z-10">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.avatarGradient} text-white flex items-center justify-center font-bold text-xs shadow-md font-outfit`}>
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-outfit">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t.role} · {t.location}
                  </p>
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
