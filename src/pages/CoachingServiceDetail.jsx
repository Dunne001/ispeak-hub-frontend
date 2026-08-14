import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PaymentModal from '../components/PaymentModal';

export default function CoachingServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('online');
  const [booking, setBooking] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);

  useEffect(() => {
    api.get(`/coaching-services/${id}`)
      .then((res) => {
        setService(res.data);
        setDeliveryMode(res.data.delivery_mode === 'physical' ? 'physical' : 'online');
      })
      .catch(() => setError('Could not load this service right now.'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  const loadSlots = (selectedDate) => {
    setDate(selectedDate);
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    api.get(`/coaching-services/${id}/available-slots`, { params: { date: selectedDate } })
      .then((res) => setSlots(res.data.slots))
      .catch(() => toast.error('Could not load available slots.'))
      .finally(() => setSlotsLoading(false));
  };

  const handleBook = async (slot) => {
    setBooking(true);
    try {
      const res = await api.post('/bookings', {
        coaching_service_id: service.id,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        delivery_mode: deliveryMode,
      });
      toast.success('Booking created — pay to confirm.');
      setActiveBookingId(res.data.id);
      loadSlots(date);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not book that slot.');
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

  if (error || !service) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center text-error">
          {error || 'Service not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">{service.title}</h1>
      <p className="mb-6 text-sm text-navy/60">
        {service.duration_minutes} min · {formatPrice(service.price_cents, service.currency)}
      </p>

      <h2 className="mb-3 font-display text-lg font-semibold text-navy">Pick a slot</h2>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="date"
          value={date}
          onChange={(e) => loadSlots(e.target.value)}
          className="rounded-lg border border-navy/20 px-3 py-2"
        />
        {service.delivery_mode === 'either' && (
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2"
          >
            <option value="online">Online</option>
            <option value="physical">Physical</option>
          </select>
        )}
      </div>

      {slotsLoading && <p className="text-sm text-navy/50">Loading slots…</p>}

      {!slotsLoading && date && slots.length === 0 && (
        <p className="mb-6 text-sm text-navy/50">No open slots that day.</p>
      )}

      {!slotsLoading && slots.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={slot.starts_at}
              onClick={() => handleBook(slot)}
              disabled={booking}
              className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy transition hover:border-gold hover:bg-gold/10 disabled:opacity-50"
            >
              {new Date(slot.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
      )}

      {activeBookingId && (
        <PaymentModal
          type="booking"
          id={activeBookingId}
          onClose={() => setActiveBookingId(null)}
          onConfirmed={() => toast.success('Payment confirmed')}
        />
      )}
    </div>
  );
}