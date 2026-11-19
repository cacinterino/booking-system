import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: easeOut },
  }),
};

export function Hero() {
  return (
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brass/40 bg-brass/10 text-brass-soft text-sm font-mono mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-brass opacity-75"
                  style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                />
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
              No-shows <span className="text-brass">cancelled.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg sm:text-xl text-paper-white/80 leading-relaxed max-w-xl"
            >
              Booked. is a booking platform for clinics, salons, barbershops,
              and spas. Publish your services, set your team's weekly hours, and
              share one booking link that only offers slots you can actually take.
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

          <HeroVisual />
        </div>
      </div>

      <div className="relative border-t border-paper-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <StatStrip />
        </div>
      </div>
    </section>
  );
}

function StatStrip() {
  const stats = [
    {
      title: 'No double-bookings',
      desc: 'A database constraint rejects overlapping bookings, so the same slot can never be sold twice.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01m6.364-4.364a9 9 0 11-12.728 0L12 4.29l6.364-.654z" />
        </svg>
      ),
    },
    {
      title: 'Public booking link',
      desc: 'One page per business: pick a service, a staff member, and an open slot.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.172-1.172M10.172 13.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.172 1.172" />
        </svg>
      ),
    },
    {
      title: 'Staff schedules',
      desc: 'Weekly hours and date overrides feed one availability engine per service and staff member.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Set up in minutes',
      desc: 'Register a business, add services and staff, then open your booking link.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((item, i) => (
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
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
      className="relative hidden lg:block"
    >
      <div className="relative mx-auto max-w-md">
        <div className="absolute -inset-4 bg-gradient-to-br from-brass/30 to-transparent rounded-3xl blur-2xl" aria-hidden="true" />
        <div className="ticket !rotate-0 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate uppercase tracking-widest">Upcoming</p>
              <p className="font-display text-2xl font-semibold text-ink mt-1">Manicure + Polish</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sage/15 text-sage text-xs font-semibold">Confirmed</span>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center font-display font-bold text-brass-deep">
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
        <div className="absolute -bottom-24 -left-8 ticket-plain !rotate-3 w-44 animate-float-slow">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-brass/15 flex items-center justify-center text-brass">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Access code ready</p>
              <p className="text-xs text-slate">Look up or cancel later</p>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -right-8 ticket-plain !-rotate-2 w-40 animate-float">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage" />
            <p className="text-sm font-semibold text-ink">Slot confirmed</p>
          </div>
          <p className="text-xs text-slate mt-1 font-mono">Signature Facial · ₱1,200</p>
        </div>
      </div>
    </motion.div>
  );
}
