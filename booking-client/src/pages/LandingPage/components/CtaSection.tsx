import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[40rem] h-[24rem] rounded-full bg-brass/20 blur-[120px]" aria-hidden="true" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-paper-white leading-tight">
            Your calendar is waiting to be filled.
          </h2>
          <p className="mt-5 text-lg text-paper-white/75 max-w-xl mx-auto">
            Built for Philippine service businesses. Create your booking page, add your
            team, and share one link with your customers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/register" className="btn-on-dark text-lg w-full sm:w-auto px-8 py-4">
              Get Started Free
            </a>
            <a href="/login" className="btn-outline-on-dark text-lg w-full sm:w-auto px-8 py-4">
              Sign In
            </a>
          </div>
          <p className="mt-6 text-sm text-paper-white/50">
            Free while in beta · Payments not yet enabled
          </p>
        </motion.div>
      </div>
    </section>
  );
}
