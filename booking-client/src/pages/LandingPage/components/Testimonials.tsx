import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-paper-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="font-mono text-xs font-semibold text-brass-deep uppercase tracking-widest mb-4">
            Word on the street
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
            Early access, built in the open
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
              className="card flex flex-col h-full"
            >
              <div className="flex gap-0.5 text-brass mb-4 font-mono text-xs uppercase tracking-widest" aria-hidden="true">
                Early access
              </div>
              <p className="font-display text-lg italic leading-relaxed text-ink flex-1">
                A real customer story lands here soon.
              </p>
              <div className="mt-6 pt-6 border-t border-line flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-ink/5 flex items-center justify-center font-display font-bold text-brass-deep">
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
          className="text-center text-sm text-slate mt-10 max-w-prose mx-auto"
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
          <a href="/register" className="btn-secondary text-sm">
            Be one of them
          </a>
        </motion.div>
      </div>
    </section>
  );
}
