import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PurposeSection } from './components/PurposeSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { Marquee } from './components/Marquee';
import { Testimonials } from './components/Testimonials';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

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
