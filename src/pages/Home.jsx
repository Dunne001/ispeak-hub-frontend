import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Welcome, {user?.name}</h1>
          <p className="text-sm text-navy/60">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-navy/20 px-4 py-2 text-sm font-medium text-navy transition hover:bg-navy hover:text-cream"
        >
          Sign out
        </button>
      </div>

      <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
        Your bookings, courses, and orders will appear here.
      </div>
    </div>
  );
}