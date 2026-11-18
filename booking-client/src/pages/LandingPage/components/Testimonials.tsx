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
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
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
