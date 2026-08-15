import { useAuth } from '../shared/context/AuthContext';
import { Link } from 'react-router-dom';
import { useMyWorkspace } from '../features/staff/hooks';

export function DashboardPage() {
  const { user } = useAuth();
  const isStaff = user?.roles.includes('Staff') ?? false;
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const { data: workspace } = useMyWorkspace(isStaff || isAdmin);

  const stats = [
    { label: 'Upcoming Bookings', value: '0', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { label: 'This Week', value: '0', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: 'This Month', value: '0', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
  ];

  const quickActions = isStaff || isAdmin
    ? [
        {
          label: 'New Booking',
          desc: 'Open your booking page',
          href: workspace?.businessSlug ? `/book/${workspace.businessSlug}` : '/staff/calendar',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          label: 'Calendar',
          desc: 'Manage all appointments',
          href: '/staff/calendar',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        ...(isAdmin
          ? [
              {
                label: 'Services',
                desc: 'Manage your services',
                href: '/admin/services',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
              },
              {
                label: 'Staff',
                desc: 'Manage team members',
                href: '/admin/staff',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
            ]
          : []),
      ]
    : [
        {
          label: 'My Bookings',
          desc: 'View and manage appointments',
          href: '/my-bookings',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          label: 'Find a Business',
          desc: 'Book an appointment',
          href: '/',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          ),
        },
      ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-ink font-display">Welcome, {user?.fullName}</h1>
          <p className="text-slate mt-2">Here's what's happening with your bookings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="card hover:shadow-lg transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate">{stat.label}</h2>
                <div className="p-2 bg-brass/10 rounded-lg text-brass group-hover:bg-brass/20 transition-colors">
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-ink font-display">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-ink font-display">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="card hover:shadow-lg hover:border-brass transition-all text-center"
              >
                <div className="p-3 bg-brass/10 rounded-lg text-brass mx-auto mb-4 w-fit group-hover:bg-brass/20 transition-colors">
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-ink font-display">{action.label}</h3>
                <p className="text-slate text-sm mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}