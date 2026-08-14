import React, { useState } from 'react';

// ─── LANDING PAGE SECTIONS ───────────────────────────────────────────────
import { LandingNavbar } from '../../components/landing/LandingNavbar.jsx';
import { HeroSection } from '../../components/landing/HeroSection.jsx';
import { SocialProofMarquee } from '../../components/landing/SocialProofMarquee.jsx';
import { StatsSection } from '../../components/landing/StatsSection.jsx';
import { FeaturesSection } from '../../components/landing/FeaturesSection.jsx';
import { HowItWorksSection } from '../../components/landing/HowItWorksSection.jsx';
import { WhyUsSection } from '../../components/landing/WhyUsSection.jsx';
import { TestimonialsSection } from '../../components/landing/TestimonialsSection.jsx';
import { PricingSection } from '../../components/landing/PricingSection.jsx';
import { FAQSection } from '../../components/landing/FAQSection.jsx';
import { CTASection } from '../../components/landing/CTASection.jsx';
import { LandingFooter } from '../../components/landing/LandingFooter.jsx';
import { LandingLoginModal } from '../../components/landing/LandingLoginModal.jsx';
import { MouseGlow } from '../../components/landing/ui/MouseGlow.jsx';

export const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLogin = () => setIsLoginModalOpen(true);
  const handleCloseLogin = () => setIsLoginModalOpen(false);

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Interactive Cursor Mouse Glow */}
      <MouseGlow />

      {/* Content Layer */}
      <div className="relative z-10 space-y-0">
        {/* ─── 1. STICKY NAVIGATION BAR ─────────────────────────────────── */}
        <LandingNavbar onOpenLogin={handleOpenLogin} />

        {/* ─── 2. HERO SECTION ─────────────────────────────────────────── */}
        <HeroSection onOpenLogin={handleOpenLogin} />

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
        <CTASection onOpenLogin={handleOpenLogin} />

        {/* ─── 11. PROFESSIONAL FOOTER ─────────────────────────────────── */}
        <LandingFooter />

        {/* ─── QUICK LOGIN MODAL OVERLAY ───────────────────────────────── */}
        <LandingLoginModal isOpen={isLoginModalOpen} onClose={handleCloseLogin} />
      </div>
    </div>
  );
};

export default LandingPage;
