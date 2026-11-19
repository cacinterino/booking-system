import { useState, useEffect } from 'react';
import { Navbar } from './LandingPage/components/Navbar';
import { Hero } from './LandingPage/components/Hero';
import { PurposeSection } from './LandingPage/components/PurposeSection';
import { FeaturesGrid } from './LandingPage/components/FeaturesGrid';
import { Marquee } from './LandingPage/components/Marquee';
import { Testimonials } from './LandingPage/components/Testimonials';
import { CtaSection } from './LandingPage/components/CtaSection';
import { Footer } from './LandingPage/components/Footer';

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <Navbar scrolled={scrolled} />
      <Hero />
      <PurposeSection />
      <FeaturesGrid />
      <Marquee />
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  );
}
