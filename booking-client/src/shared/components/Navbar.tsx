import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../ui';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/staff/calendar', label: 'Calendar' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/staff', label: 'Staff' },
];

const staffLinks = [
  { to: '/staff/calendar', label: 'Calendar' },
];

const customerLinks = [
  { to: '/my-bookings', label: 'My Bookings' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isStaff = user?.roles.includes('Staff') ?? false;
  const isCustomer = !!user && !isAdmin && !isStaff;

  const links = isAdmin ? adminLinks : isStaff ? staffLinks : customerLinks;
  const roleLabel = isAdmin ? 'Admin' : isStaff ? 'Staff' : isCustomer ? 'Customer' : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper-white/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="font-display text-xl font-bold text-ink flex items-center gap-1.5">
              <span>Booked</span>
              <span className="text-brass">.</span>
            </Link>

            {roleLabel && (
              <span className="hidden sm:inline-flex items-center rounded-full border border-brass/30 bg-brass/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brass-deep font-semibold">
                {roleLabel}
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'text-brass-deep bg-brass/10 font-semibold'
                      : 'text-slate hover:text-ink hover:bg-ink/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brass/10 text-brass-deep' : 'text-ink hover:bg-ink/5'
                }`
              }
            >
              <span className="w-7 h-7 rounded-full bg-brass/15 text-brass-deep flex items-center justify-center font-display font-bold text-xs">
                {user?.fullName?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="font-medium text-ink">{user?.fullName?.split(' ')[0]}</span>
            </NavLink>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-ink hover:bg-ink/5 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-paper-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {roleLabel && (
              <div className="px-3 py-1 mb-2">
                <span className="inline-flex items-center rounded-full border border-brass/30 bg-brass/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brass-deep font-semibold">
                  {roleLabel} workspace
                </span>
              </div>
            )}
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'text-brass-deep bg-brass/10 font-semibold' : 'text-ink hover:bg-ink/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/profile"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink hover:bg-ink/5"
            >
              Profile
            </NavLink>
            <div className="pt-2 border-t border-line mt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Outlet />
    </div>
  );
}
