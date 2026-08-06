import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: easeOut },
  }),
};

const features = [
  {
    title: 'Smart Scheduling',
    desc: 'Real-time availability that combines staff schedules, overrides, and booking conflicts — so double-bookings never happen.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'GCash & Maya Payments',
    desc: 'Accept deposits through PayMongo to hold slots and cut no-shows. Secure, compliant, and built for the PH market.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: 'Automated Reminders',
    desc: 'Email and SMS reminders 24h and 1h before each appointment, so fewer people forget — and fewer slots go empty.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    title: 'Team & Calendar Views',
    desc: 'One calendar for your whole team. See today at a glance, shift bookings between staff, and track every status.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Your Own Booking Page',
    desc: 'A public link you share with customers. They pick a service, a staff, and a slot — no app to download.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.172-1.172M10.172 13.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.172 1.172" />
      </svg>
    ),
  },
  {
    title: 'Data You Own',
    desc: 'Built on PostgreSQL with clean architecture and strict privacy practices. Your data stays yours — RA 10173 aware.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const useCases = ['Clinics', 'Salons', 'Barbershops', 'Spas', 'Dental Clinics', 'Tattoo Studios', 'Consultancies', 'Grooming Lounges'];

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-paper/85 backdrop-blur-md border-b border-line' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center group">
              <span className={`font-display text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-ink' : 'text-paper-white'}`}>
                Booked<span className="text-brass">.</span>
              </span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                to="/login"
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${scrolled ? 'text-slate hover:text-ink' : 'text-paper-white/85 hover:text-paper-white'}`}
              >
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper-white">
        <div className="absolute inset-0 bg-grid-faint" aria-hidden="true" />
        <div
          className="absolute -top-32 -right-24 w-[34rem] h-[34rem] rounded-full bg-brass/20 blur-[110px] animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-24 w-[30rem] h-[30rem] rounded-full bg-sage/20 blur-[110px] animate-float"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 lg:pt-44 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brass/40 bg-brass/10 text-brass-soft text-sm font-medium mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brass opacity-75" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brass" />
                </span>
                Built for service businesses in the Philippines
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={1}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
              >
                Appointments booked.<br />
                No-shows <span className="text-gradient-brass">cancelled.</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={2}
                className="mt-6 text-lg sm:text-xl text-paper-white/80 leading-relaxed max-w-xl"
              >
                Booked. is the all-in-one booking platform for clinics, salons,
                barbershops, and spas across the Philippines — real-time schedules,
                GCash & Maya deposits, and automated reminders in one place.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={3}
                className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <Link to="/register" className="btn-on-dark text-base w-full sm:w-auto">
                  Start free today
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link to="/login" className="btn-outline-on-dark text-base w-full sm:w-auto">
                  See it in action
                </Link>
              </motion.div>

              <motion.p
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={4}
                className="mt-6 text-sm text-paper-white/60"
              >
                Free to start · No credit card required · Set up in minutes
              </motion.p>
            </div>

            {/* Hero mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-br from-brass/30 to-transparent rounded-3xl blur-2xl" aria-hidden="true" />
                <div className="ticket !rotate-0 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate uppercase tracking-widest">Upcoming</p>
                      <p className="font-display text-2xl font-semibold text-ink mt-1">Manicure + Polish</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-sage/15 text-sage text-xs font-semibold">Deposit paid</span>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center font-display font-bold text-brass">
                      JM
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Jasmine Mercado</p>
                      <p className="text-sm text-slate">with Ana · Salon 2</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 border-t border-dashed border-line pt-5">
                    <div>
                      <p className="text-xs text-slate">Date</p>
                      <p className="text-sm font-semibold text-ink">Aug 12</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate">Time</p>
                      <p className="text-sm font-semibold text-ink">3:00 PM</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate">Ref</p>
                      <p className="text-sm font-semibold text-ink font-mono">#BK-2841</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-10 ticket-plain !rotate-3 w-52 shadow-xl animate-float-slow">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-brass/15 flex items-center justify-center text-brass">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Reminder sent</p>
                      <p className="text-xs text-slate">24h before via SMS</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 ticket-plain !-rotate-2 w-44 shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sage" />
                    <p className="text-sm font-semibold text-ink">Slot confirmed</p>
                  </div>
                  <p className="text-xs text-slate mt-1 font-mono">GCash · ₱150.00</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative border-t border-paper-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'Double-book proof',
                  desc: 'Real-time slot locking stops two customers taking the same slot.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01m6.364-4.364a9 9 0 11-12.728 0L12 4.29l6.364-.654z" />
                    </svg>
                  ),
                },
                {
                  title: 'Deposits via GCash & Maya',
                  desc: 'PayMongo-powered deposits to cut no-shows without a big setup.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-4.4 0-8 1.8-8 4s3.6 4 8 4 8-1.8 8-4-3.6-4-8-4zm0 8v2" />
                    </svg>
                  ),
                },
                {
                  title: 'Auto reminders',
                  desc: 'SMS + email nudges 24h and 1h before each appointment.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  ),
                },
                {
                  title: 'Set up in minutes',
                  desc: 'A public booking link, no device installs, no card required to start.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  custom={i}
                  className="p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-brass/15 text-brass-soft flex items-center justify-center shrink-0">
                      {item.icon}
                    </span>
                    <p className="font-display text-base font-semibold text-paper-white">{item.title}</p>
                  </div>
                  <p className="text-sm text-paper-white/60 mt-2 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-20 lg:py-28 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-sm font-semibold text-brass uppercase tracking-widest mb-4">Why Booked.</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
              Running a service business is hard. Filling your calendar shouldn't be.
            </h2>
            <p className="mt-6 text-lg text-slate leading-relaxed">
              Every day, clinics, salons, and studios lose money to no-shows, missed calls,
              and double-bookings. Booked. puts your whole schedule online — customers pick
              a real, available slot, pay a small deposit with GCash or Maya, and get a
              reminder so they actually show up.
            </p>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Share your link',
                desc: 'Your business gets a public booking page. Post it in your bio, on your wall, or on your DMs.',
              },
              {
                n: '02',
                title: 'Customers book & pay',
                desc: 'They choose a service, a staff, and a real open slot — and secure it with a small GCash or Maya deposit.',
              },
              {
                n: '03',
                title: 'You run the day',
                desc: 'Your team sees everything live on one calendar. Reminders go out automatically. No-shows drop.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: easeOut }}
                whileHover={{ y: -6 }}
                className="card relative overflow-hidden group"
              >
                <div className="w-11 h-11 rounded-xl bg-brass/12 text-brass flex items-center justify-center mb-5 font-display font-bold">
                  {step.n}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">{step.title}</h3>
                <p className="text-slate leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-ink text-paper-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <p className="text-sm font-semibold text-brass-soft uppercase tracking-widest mb-4">What you get</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-paper-white leading-tight">
              Everything your business needs to run smoother
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.1, ease: easeOut }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-paper-white/10 bg-paper-white/[0.04] p-7 hover:bg-paper-white/[0.07] hover:border-brass/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-brass/15 text-brass-soft flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-paper-white mb-2">{feature.title}</h3>
                <p className="text-paper-white/70 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases marquee */}
      <section className="py-14 bg-paper border-y border-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-display text-2xl sm:text-3xl font-bold text-ink"
          >
            Made for your kind of business
          </motion.h2>
        </div>
        <div className="relative">
          <div className="flex gap-4 animate-marquee w-max">
            {[...useCases, ...useCases].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-line bg-paper-white text-ink font-medium whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full bg-brass" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (honest placeholders) */}
      <section className="py-20 lg:py-28 bg-paper-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <p className="text-sm font-semibold text-brass uppercase tracking-widest mb-4">Word on the street</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
              Business owners who use Booked. every day
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: easeOut }}
                className="card flex flex-col h-full"
              >
                <div className="flex gap-0.5 text-brass mb-4" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-display text-lg italic leading-relaxed text-ink flex-1">
                  A real customer story lands here soon.
                </p>
                <div className="mt-6 pt-6 border-t border-line flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-ink/5 flex items-center justify-center font-display font-bold text-brass">
                    ?
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Your first customer</p>
                    <p className="text-xs text-slate">Salon · Manila</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-sm text-slate mt-10"
          >
            We're brand new — and we're looking for early partners to test Booked. free before launch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-center"
          >
            <Link to="/register" className="btn-secondary text-sm">
              Be one of them
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[40rem] h-[24rem] rounded-full bg-brass/20 blur-[120px]" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-paper-white leading-tight">
              Your calendar is waiting to be filled.
            </h2>
            <p className="mt-5 text-lg text-paper-white/75 max-w-xl mx-auto">
              Join service businesses across the Philippines already booking, taking deposits,
              and cutting their no-shows with Booked.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-on-dark text-lg w-full sm:w-auto px-8 py-4">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-outline-on-dark text-lg w-full sm:w-auto px-8 py-4">
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-sm text-paper-white/50">Free forever for small teams · GCash & Maya powered</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink border-t border-paper-white/10 text-slate py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <p className="font-display text-2xl font-bold text-paper-white">
                Booked<span className="text-brass">.</span>
              </p>
              <p className="text-sm text-slate mt-3 max-w-xs leading-relaxed">
                Appointment booking, deposits, and reminders for Philippine service businesses.
              </p>
            </div>
            <div>
              <h4 className="font-display text-paper-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-paper-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-paper-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-paper-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-paper-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-paper-white transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-paper-white transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-paper-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-paper-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-paper-white transition-colors">Privacy</Link></li>
                <li><Link to="#" className="hover:text-paper-white transition-colors">Terms</Link></li>
                <li><Link to="#" className="hover:text-paper-white transition-colors">RA 10173 Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-paper-white/10 mt-12 pt-8 text-center text-sm text-slate/60">
            <p>&copy; 2026 Booked. Built for the Philippines.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}