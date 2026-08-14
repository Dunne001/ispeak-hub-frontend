import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [activeBookingId, setActiveBookingId] = useState(null);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Your bookings</h1>
          <p className="text-sm text-navy/60">Coaching sessions, assessments, and package sessions</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/programmes"
            className="rounded-lg border border-navy/20 px-4 py-2 text-sm font-medium text-navy transition hover:bg-navy/5"
          >
            Browse programmes
          </Link>
          <Link
            to="/coaching-services"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
          >
            Book a session
          </Link>
        </div>
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

      {!loading && bookings.length === 0 && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          No bookings yet. Browse a programme or coaching service to get started.
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
                  {booking.session_type && (
                    <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy/60">
                      {booking.session_type}
                    </span>
                  )}
                </div>
                {booking.delivery_mode && (
                  <span className="text-xs text-navy/40 capitalize">{booking.delivery_mode}</span>
                )}
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