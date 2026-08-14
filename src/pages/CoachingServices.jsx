import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function CoachingServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/coaching-services')
      .then((res) => setServices(res.data))
      .catch(() => setError('Could not load services right now. Try refreshing the page.'))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Coaching &amp; Assessments</h1>
      <p className="mb-8 text-sm text-navy/60">Single-session coaching and assessment slots</p>

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

      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center text-error">
          {error}
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          No services available yet. Check back soon.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="overflow-hidden rounded-xl border border-navy/10 bg-white transition hover:shadow-lg"
          >
            <div className="p-4">
              <h2 className="mb-1 font-display text-lg font-semibold text-navy">{service.title}</h2>
              <p className="mb-2 text-xs uppercase tracking-wide text-navy/40">
                {service.duration_minutes} min · {service.delivery_mode === 'either' ? 'Physical or online' : service.delivery_mode}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold">
                  {formatPrice(service.price_cents, service.currency)}
                </span>
                <Link
                  to={`/coaching-services/${service.id}`}
                  className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-cream transition hover:bg-navy-light"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}