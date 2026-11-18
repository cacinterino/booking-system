const useCases = ['Clinics', 'Salons', 'Barbershops', 'Spas', 'Dental Clinics', 'Tattoo Studios', 'Consultancies', 'Grooming Lounges'];

export function Marquee() {
  return (
    <section className="py-14 bg-paper border-y border-line overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Made for your kind of business
        </h2>
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
  );
}
