import React, { Suspense, lazy } from 'react';

// ─── CRITICAL ABOVE-THE-FOLD COMPONENTS (Instant Render) ────────────────
import { LandingNavbar } from '../../components/landing/LandingNavbar.jsx';
import { HeroSection } from '../../components/landing/HeroSection.jsx';
import { MouseGlow } from '../../components/landing/ui/MouseGlow.jsx';

// ─── BELOW-THE-FOLD SECTIONS (Lazy Loaded on Scroll for 1-Second Cold Start)
const SocialProofMarquee = lazy(() => import('../../components/landing/SocialProofMarquee.jsx').then(m => ({ default: m.SocialProofMarquee })));
const StatsSection = lazy(() => import('../../components/landing/StatsSection.jsx').then(m => ({ default: m.StatsSection })));
const FeaturesSection = lazy(() => import('../../components/landing/FeaturesSection.jsx').then(m => ({ default: m.FeaturesSection })));
const HowItWorksSection = lazy(() => import('../../components/landing/HowItWorksSection.jsx').then(m => ({ default: m.HowItWorksSection })));
const WhyUsSection = lazy(() => import('../../components/landing/WhyUsSection.jsx').then(m => ({ default: m.WhyUsSection })));
const TestimonialsSection = lazy(() => import('../../components/landing/TestimonialsSection.jsx').then(m => ({ default: m.TestimonialsSection })));
const PricingSection = lazy(() => import('../../components/landing/PricingSection.jsx').then(m => ({ default: m.PricingSection })));
const FAQSection = lazy(() => import('../../components/landing/FAQSection.jsx').then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import('../../components/landing/CTASection.jsx').then(m => ({ default: m.CTASection })));
const LandingFooter = lazy(() => import('../../components/landing/LandingFooter.jsx').then(m => ({ default: m.LandingFooter })));

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-white relative overflow-x-hidden">

      {/* Interactive Cursor Mouse Glow */}
      <MouseGlow />

      {/* Content Layer */}
      <div className="relative z-10 space-y-0">
        {/* ─── 1. STICKY NAVIGATION BAR ─────────────────────────────────── */}
        <LandingNavbar />

        {/* ─── 2. HERO SECTION ─────────────────────────────────────────── */}
        <HeroSection />

        <Suspense fallback={null}>
          {/* ─── INTEGRATION PARTNERS MARQUEE ───────────────────────────── */}
          <SocialProofMarquee />

          {/* ─── 3. STATISTICS SECTION ───────────────────────────────────── */}
          <StatsSection />

          {/* ─── 4. FEATURES SECTION (INTERACTIVE CORE OS CAPABILITIES) ─── */}
          <FeaturesSection />

          {/* ─── 5. HOW IT WORKS SECTION ─────────────────────────────────── */}
          <HowItWorksSection />

          {/* ─── 6. WHY CHOOSE US & SECURITY SECTION ──────────────────────── */}
          <WhyUsSection />

          {/* ─── 7. TESTIMONIALS SECTION ─────────────────────────────────── */}
          <TestimonialsSection />

          {/* ─── 8. PRICING SECTION ──────────────────────────────────────── */}
          <PricingSection />

          {/* ─── 9. FAQ ACCORDION SECTION ────────────────────────────────── */}
          <FAQSection />

          {/* ─── 10. CALL TO ACTION BANNER ────────────────────────────────── */}
          <CTASection />

          {/* ─── 11. PROFESSIONAL FOOTER ─────────────────────────────────── */}
          <LandingFooter />
        </Suspense>
      </div>
    </div>
  );
};

export default LandingPage;
