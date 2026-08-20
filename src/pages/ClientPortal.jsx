import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Package,
  MessageSquareText,
  BookOpen,
  CalendarCheck,
  LogOut,
  ClipboardList,
  Receipt,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [{ to: '/dashboard', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Learning',
    items: [
      { to: '/courses', label: 'Courses', icon: GraduationCap },
      { to: '/programmes', label: 'Programmes', icon: Package },
      { to: '/coaching-services', label: 'Coaching & Assessments', icon: MessageSquareText },
    ],
  },
  {
    label: 'Shop & Bookings',
    items: [
      { to: '/products', label: 'Books', icon: BookOpen },
      { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
      { to: '/dashboard/timetable', label: 'Timetable', icon: CalendarDays },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/requests', label: 'Requests', icon: ClipboardList },
      { to: '/dashboard/fee-statement', label: 'Fee statement', icon: Receipt },
    ],
  },
];

export default function ClientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [enrollments, setEnrollments] = useState([]);
  const [packageEnrollments, setPackageEnrollments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/enrollments').catch(() => ({ data: [] })),
      api.get('/package-enrollments').catch(() => ({ data: [] })),
      api.get('/bookings').catch(() => ({ data: [] })),
    ]).then(([e, p, b]) => {
      setEnrollments(e.data);
      setPackageEnrollments(p.data);
      setBookings(b.data);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const upcoming = bookings
    .filter((b) => new Date(b.starts_at) > new Date() && b.status !== 'declined')
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 5);

  const isOverview = location.pathname === '/dashboard';
  const initial = user?.name?.[0]?.toUpperCase() || '?';
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="flex w-64 shrink-0 flex-col print:hidden">
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light font-display text-lg font-semibold text-navy">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">{user?.name}</p>
              <p className="truncate text-xs text-navy/50">{user?.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-5 rounded-xl border border-navy/10 bg-white p-3 shadow-sm print:hidden">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-navy/35">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          active
                            ? 'bg-navy text-cream shadow-sm'
                            : 'text-navy/70 hover:bg-cream hover:text-navy'
                        }`}
                      >
                        <Icon size={17} strokeWidth={2} className={active ? 'text-gold' : ''} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm font-medium text-navy/60 shadow-sm transition hover:border-error/30 hover:bg-error/5 hover:text-error"
          >
            <LogOut size={17} strokeWidth={2} />
            Log out
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          {isOverview ? (
            <>
              <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-cream shadow-md">
                <h1 className="mb-1 font-display text-2xl font-semibold">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-cream/70">Here's where things stand across your account.</p>
              </div>

              {loading && (
                <div className="flex justify-center py-16">
                  <div className="flex gap-1">
                    {[8, 14, 20, 14, 8].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 animate-pulse rounded-full bg-gold"
                        style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!loading && (
                <div className="space-y-8">
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
                        <Package size={16} strokeWidth={2.5} />
                      </span>
                      Package progress
                    </h2>
                    {packageEnrollments.length === 0 && (
                      <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-6 text-center text-sm text-navy/50">
                        No active packages yet — browse programmes to get started.
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {packageEnrollments.map((e) => (
                        <Link
                          key={e.id}
                          to={`/programmes/${e.programme_id}`}
                          className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <p className="mb-2 font-medium text-navy">{e.programme?.title}</p>
                          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((e.progress?.sessions_total - e.progress?.sessions_remaining) /
                                    Math.max(e.progress?.sessions_total, 1)) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-navy/60">
                            <span>{e.progress?.sessions_remaining} of {e.progress?.sessions_total} sessions left</span>
                            <span>{e.progress?.days_left} days left</span>
                          </div>
                          {e.progress?.balance_remaining_cents > 0 && (
                            <p className="mt-2 inline-block rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                              Balance due: KES {(e.progress.balance_remaining_cents / 100).toLocaleString()}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
                        <GraduationCap size={16} strokeWidth={2.5} />
                      </span>
                      Enrolled courses
                    </h2>
                    {enrollments.length === 0 && (
                      <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-6 text-center text-sm text-navy/50">
                        Not enrolled in any courses yet.
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {enrollments.map((e) => (
                        <Link
                          key={e.id}
                          to={`/courses/${e.course_id}`}
                          className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <p className="font-medium text-navy">{e.course?.title}</p>
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
                        <CalendarCheck size={16} strokeWidth={2.5} />
                      </span>
                      Upcoming sessions
                    </h2>
                    {upcoming.length === 0 && (
                      <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-6 text-center text-sm text-navy/50">
                        Nothing scheduled yet.
                      </div>
                    )}
                    <div className="space-y-2">
                      {upcoming.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-3 shadow-sm"
                        >
                          <span className="text-sm text-navy">
                            {new Date(b.starts_at).toLocaleString()}
                            {b.session_type && ` · ${b.session_type}`}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              b.status === 'approved' ? 'bg-success/10 text-success' : 'bg-gold/10 text-gold'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}