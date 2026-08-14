import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PaymentModal from '../components/PaymentModal';

export default function ProgrammeDetail() {
  const { id } = useParams();
  const [programme, setProgramme] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ session_type: 'session', starts_at: '', delivery_mode: 'online' });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/programmes/${id}`),
      api.get('/package-enrollments').catch(() => ({ data: [] })),
    ])
      .then(([programmeRes, enrollmentsRes]) => {
        setProgramme(programmeRes.data);
        const match = enrollmentsRes.data.find(
          (e) => e.programme_id === Number(id) && e.status === 'active'
        );
        if (match) {
          return api.get(`/package-enrollments/${match.id}`).then((res) => setEnrollment(res.data));
        }
      })
      .catch(() => setError('Could not load this programme right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      await api.post(`/package-enrollments/${enrollment.id}/sessions`, form);
      toast.success('Session booked — pending approval.');
      setForm({ ...form, starts_at: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not book that session.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  if (error || !programme) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center text-error">
          {error || 'Programme not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">{programme.title}</h1>
      <p className="mb-2 text-sm text-navy/60">
        {programme.sessions_count} sessions
        {programme.practicals_count > 0 && ` + ${programme.practicals_count} practicals`}
        {' · '}{programme.duration_min_weeks}-{programme.duration_max_weeks} weeks
        {' · '}{programme.delivery_mode === 'either' ? 'Physical or online' : programme.delivery_mode}
      </p>
      {programme.description && <p className="mb-6 text-navy/60">{programme.description}</p>}

      {!enrollment && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 p-4">
          <span className="font-medium text-navy">
            {formatPrice(programme.price_cents, programme.currency)}
          </span>
          <button
            onClick={() => setShowPayment(true)}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
          >
            Purchase package
          </button>
        </div>
      )}

      {enrollment && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-navy/10 bg-white p-3 text-center">
              <div className="text-xl font-semibold text-navy">{enrollment.progress.sessions_remaining}</div>
              <div className="text-xs text-navy/50">of {enrollment.progress.sessions_total} sessions left</div>
            </div>
            {enrollment.progress.practicals_total > 0 && (
              <div className="rounded-lg border border-navy/10 bg-white p-3 text-center">
                <div className="text-xl font-semibold text-navy">{enrollment.progress.practicals_remaining}</div>
                <div className="text-xs text-navy/50">of {enrollment.progress.practicals_total} practicals left</div>
              </div>
            )}
            <div className="rounded-lg border border-navy/10 bg-white p-3 text-center">
              <div className="text-xl font-semibold text-navy">{enrollment.progress.days_left}</div>
              <div className="text-xs text-navy/50">days left</div>
            </div>
            <div className="rounded-lg border border-navy/10 bg-white p-3 text-center">
              <div className="text-xl font-semibold text-navy">{enrollment.progress.expires_on}</div>
              <div className="text-xs text-navy/50">expires</div>
            </div>
          </div>

          <h2 className="mb-3 font-display text-lg font-semibold text-navy">Book a session</h2>
          <form onSubmit={handleBook} className="mb-8 space-y-3 rounded-xl border border-navy/10 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={form.session_type}
                onChange={(e) => setForm({ ...form, session_type: e.target.value })}
                className="rounded-lg border border-navy/20 px-3 py-2"
              >
                <option value="session">Session</option>
                {enrollment.progress.practicals_total > 0 && <option value="practical">Practical</option>}
              </select>
              <select
                value={form.delivery_mode}
                onChange={(e) => setForm({ ...form, delivery_mode: e.target.value })}
                className="rounded-lg border border-navy/20 px-3 py-2"
              >
                <option value="online">Online</option>
                <option value="physical">Physical</option>
              </select>
              <input
                type="datetime-local"
                required
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="rounded-lg border border-navy/20 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={booking}
              className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
            >
              {booking ? 'Booking…' : 'Request this slot'}
            </button>
          </form>

          <h2 className="mb-3 font-display text-lg font-semibold text-navy">Your sessions</h2>
          <div className="space-y-2">
            {enrollment.bookings?.length === 0 && (
              <p className="text-sm text-navy/50">No sessions booked yet.</p>
            )}
            {enrollment.bookings?.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-3"
              >
                <span className="text-navy">
                  {new Date(b.starts_at).toLocaleString()} · {b.session_type} · {b.delivery_mode}
                </span>
                <span
                  className={`text-sm font-medium ${
                    b.status === 'approved' ? 'text-success' : b.status === 'declined' ? 'text-error' : 'text-gold'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {showPayment && (
        <PaymentModal
          type="programme"
          id={programme.id}
          onClose={() => setShowPayment(false)}
          onConfirmed={() => {
            toast.success('Package purchased');
            load();
          }}
        />
      )}
    </div>
  );
}