import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-ink border-t border-paper-white/10 text-paper-white/60 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p className="font-display text-2xl font-bold text-paper-white">
              Booked<span className="text-brass">.</span>
            </p>
            <p className="text-sm text-paper-white/60 mt-3 max-w-xs leading-relaxed">
              Appointment booking for Philippine service businesses.
            </p>
          </div>
          <div>
            <h3 className="font-display text-paper-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-paper-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-paper-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-paper-white transition-colors">
                  RA 10173 Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-paper-white/10 mt-12 pt-8 text-center text-sm text-paper-white/40">
          <p>&copy; 2026 Booked. Built for the Philippines.</p>
        </div>
      </div>
    </footer>
  );
}
