
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Timetable() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings')
      .then((res) => setBookings(res.data.filter((b) => b.status !== 'declined')))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...bookings].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Timetable</h1>
          <p className="text-sm text-navy/60">Everything on your schedule</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
        >
          <Download size={16} /> Download
        </button>
      </div>

      <div className="mb-4 hidden print:block">
        <h1 className="font-display text-xl font-semibold text-navy">iSpeak Academy — Timetable</h1>
        <p className="text-sm text-navy/60">{user?.name} · {user?.email} · Generated {new Date().toLocaleDateString()}</p>
      </div>

      {loading && <p className="text-sm text-navy/50">Loading…</p>}

      {!loading && sorted.length === 0 && (
        <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-6 text-center text-sm text-navy/50 print:hidden">
          Nothing scheduled yet.
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm print:rounded-none print:border-navy/30 print:shadow-none">
          <table className="w-full text-sm">
            <thead className="border-b border-navy/10 bg-cream/50 text-left text-xs uppercase tracking-wide text-navy/40 print:bg-white">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Mode</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => (
                <tr key={b.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-2 text-navy/70">
                    {new Date(b.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-2 text-navy/70">
                    {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2 capitalize text-navy">{b.session_type || 'Booking'}</td>
                  <td className="px-4 py-2 capitalize text-navy/70">{b.delivery_mode || '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === 'approved' ? 'bg-success/10 text-success' : 'bg-gold/10 text-gold'
                      } print:bg-transparent print:px-0`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}