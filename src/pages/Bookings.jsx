import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PaymentModal from '../components/PaymentModal';

function statusBadge(status) {
  const styles = {
    pending: 'bg-gold/10 text-gold',
    approved: 'bg-success/10 text-success',
    declined: 'bg-error/10 text-error',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || ''}`}>
      {status}
    </span>
  );
}

function paymentBadge(booking) {
  const confirmed = booking.payments?.some((p) => p.status === 'confirmed');
  if (confirmed) {
    return <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Paid</span>;
  }
  const pending = booking.payments?.some((p) => p.status === 'pending');
  if (pending) {
    return <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">Payment pending</span>;
  }
  return <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy/60">Unpaid</span>;
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);

  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = () => {
    setLoading(true);
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch(() => toast.error('Could not load your bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        starts_at: startsAt,
        ends_at: endsAt,
        party_size: partySize,
        notes: notes || undefined,
      });
      toast.success('Booking created');
      setShowForm(false);
      setStartsAt('');
      setEndsAt('');
      setPartySize(1);
      setNotes('');
      loadBookings();
    } catch (err) {
      const message =
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        err.response?.data?.message ||
        'Could not create booking. Check your details and try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Your bookings</h1>
          <p className="text-sm text-navy/60">Coaching sessions and speaking engagements</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
        >
          {showForm ? 'Cancel' : 'New booking'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 space-y-4 rounded-xl border border-navy/10 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Starts at</label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy">Ends at</label>
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Party size</label>
            <input
              type="number"
              min={1}
              max={20}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold sm:w-32"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-navy">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create booking'}
          </button>
        </form>
      )}

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

      {!loading && bookings.length === 0 && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          No bookings yet. Create one to get started.
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((booking) => {
          const isPaid = booking.payments?.some((p) => p.status === 'confirmed');
          return (
            <div key={booking.id} className="rounded-xl border border-navy/10 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusBadge(booking.status)}
                  {paymentBadge(booking)}
                </div>
                <span className="text-xs text-navy/40">
                  {booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}
                </span>
              </div>
              <p className="mb-1 font-medium text-navy">
                {new Date(booking.starts_at).toLocaleString()} — {new Date(booking.ends_at).toLocaleString()}
              </p>
              {booking.notes && <p className="mb-3 text-sm text-navy/60">{booking.notes}</p>}

              {!isPaid && (
                <button
                  onClick={() => setActiveBookingId(booking.id)}
                  className="rounded-lg bg-gold px-4 py-1.5 text-sm font-medium text-navy transition hover:bg-gold-light"
                >
                  Pay now
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeBookingId && (
        <PaymentModal
          type="booking"
          id={activeBookingId}
          onClose={() => setActiveBookingId(null)}
          onConfirmed={() => {
            toast.success('Payment confirmed');
            loadBookings();
          }}
        />
      )}
    </div>
  );
}