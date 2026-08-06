import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/admin/services', label: 'Services' },
];

const staffLinks = [
  { to: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.roles.includes('Admin') ?? false;
  const links = (isAdmin ? [...adminLinks, { to: '/staff', label: 'Staff' }] : staffLinks);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper-white/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="font-display text-xl font-bold text-ink">
            Booked<span className="text-brass">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-brass bg-brass/10' : 'text-slate hover:text-ink hover:bg-ink/5'
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
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-brass bg-brass/10' : 'text-ink hover:bg-ink/5'
                }`
              }
            >
              <span className="w-7 h-7 rounded-full bg-brass/15 text-brass flex items-center justify-center font-semibold">
                {user?.fullName?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="hidden lg:inline">{user?.fullName?.split(' ')[0]}</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              Log out
            </button>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-ink"
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
        <div className="md:hidden border-t border-line bg-paper-white">
          <nav className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'text-brass bg-brass/10' : 'text-ink hover:bg-ink/5'
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
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Log out
            </button>
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