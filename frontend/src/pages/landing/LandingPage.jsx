import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';

// ─── LANDING PAGE SECTIONS ───────────────────────────────────────────────
import { LandingNavbar } from '../../components/landing/LandingNavbar.jsx';
import { HeroSection } from '../../components/landing/HeroSection.jsx';
import { SocialProofMarquee } from '../../components/landing/SocialProofMarquee.jsx';
import { StatsSection } from '../../components/landing/StatsSection.jsx';
import { FeaturesSection } from '../../components/landing/FeaturesSection.jsx';
import { HowItWorksSection } from '../../components/landing/HowItWorksSection.jsx';
import { WhyUsSection } from '../../components/landing/WhyUsSection.jsx';
import { TestimonialsSection } from '../../components/landing/TestimonialsSection.jsx';
import { FAQSection } from '../../components/landing/FAQSection.jsx';
import { LandingFooter } from '../../components/landing/LandingFooter.jsx';
import { LandingLoginModal } from '../../components/landing/LandingLoginModal.jsx';
import { MouseGlow } from '../../components/landing/ui/MouseGlow.jsx';

export const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLogin = () => setIsLoginModalOpen(true);
  const handleCloseLogin = () => setIsLoginModalOpen(false);

  return (
    <div className="min-h-screen bg-bg-base text-slate-100 font-sans selection:bg-primary-500/20 selection:text-primary-400 relative overflow-x-hidden">
      {/* Interactive Cursor Mouse Glow */}
      <MouseGlow />

      {/* ─── 1. STICKY GLASS NAVIGATION BAR ──────────────────────────── */}
      <LandingNavbar onOpenLogin={handleOpenLogin} />

      {/* ─── 2. HERO SECTION ─────────────────────────────────────────── */}
      <HeroSection onOpenLogin={handleOpenLogin} />

      {/* ─── INTEGRATION PARTNERS MARQUEE ───────────────────────────── */}
      <SocialProofMarquee />

      {/* ─── 3. STATISTICS SECTION ───────────────────────────────────── */}
      <StatsSection />

      {/* ─── 4. FEATURES SECTION ─────────────────────────────────────── */}
      <FeaturesSection />

      {/* ─── 5. HOW IT WORKS SECTION ─────────────────────────────────── */}
      <HowItWorksSection />

      {/* ─── 6. WHY CHOOSE US SECTION ────────────────────────────────── */}
      <WhyUsSection />

      {/* ─── 7. TESTIMONIALS SECTION ─────────────────────────────────── */}
      <TestimonialsSection />

      {/* ─── 8. FAQ ACCORDION SECTION ────────────────────────────────── */}
      <FAQSection />

      {/* ─── 10. PROFESSIONAL FOOTER ─────────────────────────────────── */}
      <LandingFooter />

      {/* ─── QUICK LOGIN MODAL OVERLAY ───────────────────────────────── */}
      <LandingLoginModal isOpen={isLoginModalOpen} onClose={handleCloseLogin} />
    </div>
  );
};

export default LandingPage;
