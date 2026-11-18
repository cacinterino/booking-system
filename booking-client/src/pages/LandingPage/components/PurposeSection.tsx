import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const steps = [
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
];

export function PurposeSection() {
  return (
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
          <p className="font-mono text-xs font-semibold text-brass-deep uppercase tracking-widest mb-4">
            Why Booked.
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
            Running a service business is hard. Filling your calendar shouldn't be.
          </h2>
          <p className="mt-6 text-lg text-slate leading-relaxed max-w-prose mx-auto">
            Every day, clinics, salons, and studios lose money to no-shows, missed calls,
            and double-bookings. Booked. puts your whole schedule online — customers pick
            a real, available slot, pay a small deposit with GCash or Maya, and get a
            reminder so they actually show up.
          </p>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
              whileHover={{ y: -6 }}
              className="card relative overflow-hidden group"
            >
              <div className="w-11 h-11 rounded-xl bg-brass/12 text-brass-deep flex items-center justify-center mb-5 font-display font-bold">
                {step.n}
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">{step.title}</h3>
              <p className="text-slate leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
