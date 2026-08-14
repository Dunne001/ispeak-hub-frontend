import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Programmes() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/programmes')
      .then((res) => setProgrammes(res.data))
      .catch(() => setError('Could not load programmes right now. Try refreshing the page.'))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Programmes</h1>
      <p className="mb-8 text-sm text-navy/60">Structured coaching packages from iSpeak Academy</p>

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

      {!loading && !error && programmes.length === 0 && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          No programmes available yet. Check back soon.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {programmes.map((programme) => (
          <div
            key={programme.id}
            className="overflow-hidden rounded-xl border border-navy/10 bg-white transition hover:shadow-lg"
          >
            <div className="p-4">
              <h2 className="mb-1 font-display text-lg font-semibold text-navy">{programme.title}</h2>
              <p className="mb-2 text-xs uppercase tracking-wide text-navy/40">
                {programme.sessions_count} sessions{programme.practicals_count > 0 && ` + ${programme.practicals_count} practicals`}
                {' · '}{programme.duration_min_weeks}-{programme.duration_max_weeks} weeks
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold">
                  {formatPrice(programme.price_cents, programme.currency)}
                </span>
                <Link
                  to={`/programmes/${programme.id}`}
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