import { motion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    title: 'Availability Engine',
    desc: 'Combines weekly hours, date overrides, service duration, and existing bookings into bookable slots per day.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Service Catalogue',
    desc: 'Each service carries its duration, price, and the staff members who can deliver it.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    title: 'Booking Lookup',
    desc: 'Guests get an access code to find, reschedule, or cancel their appointment without an account.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm-3 10v-4m0 0a4 4 0 10-4 4h8a4 4 0 00-4-4z" />
      </svg>
    ),
  },
  {
    title: 'Team Calendar',
    desc: 'Week view per staff member or the whole business, with confirm, complete, and no-show actions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Your Own Booking Page',
    desc: 'A public link you share with customers. They pick a service, a staff member, and a slot — no app to download.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.172-1.172M10.172 13.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.172 1.172" />
      </svg>
    ),
  },
  {
    title: 'Data You Own',
    desc: 'PostgreSQL storage, clean architecture, and no third-party analytics on customer bookings.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 lg:py-28 bg-ink text-paper-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.7 } },
          }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="font-mono text-xs font-semibold text-brass-soft uppercase tracking-widest mb-4">
            What you get
          </p>
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
  );
}
