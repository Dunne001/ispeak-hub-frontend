import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

function DownloadButton({ productId, title }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${productId}/download`);
      window.open(res.data.download_url, '_blank');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not get download link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full rounded-lg border border-gold bg-gold/10 px-4 py-2.5 font-medium text-navy transition hover:bg-gold/20 disabled:opacity-50"
    >
      {loading ? 'Preparing download…' : `Download "${title}"`}
    </button>
  );
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [status, setStatus] = useState('checking');
  const [record, setRecord] = useState(null);

  useEffect(() => {
    if (!type || !id) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const endpoint = type === 'order' ? `/orders/${id}` : `/bookings/${id}`;
        const res = await api.get(endpoint);
        if (cancelled) return;

        setRecord(res.data);

        const isPaid =
          type === 'order'
            ? res.data.status === 'paid'
            : res.data.payments?.some((p) => p.status === 'confirmed');

        if (isPaid) {
          setStatus('confirmed');
          return;
        }

        attempts += 1;
        if (attempts >= MAX_POLLS) {
          setStatus('pending');
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [type, id]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === 'checking' && (
          <>
            <div className="mb-6 flex justify-center gap-1">
              {[8, 14, 20, 14, 8].map((h, i) => (
                <span
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-gold"
                  style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-navy">Confirming your payment…</h1>
            <p className="text-sm text-navy/60">This usually takes a few seconds.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="mb-6 flex justify-center gap-1">
              {[20, 14, 8, 14, 20].map((h, i) => (
                <span key={i} className="w-1 rounded-full bg-gold" style={{ height: `${h}px` }} />
              ))}
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-navy">Payment confirmed</h1>
            <p className="mb-6 text-sm text-navy/60">
              {type === 'order' ? 'Your order is complete.' : 'Your booking is confirmed.'}
            </p>

            {type === 'order' && record?.items?.length > 0 && (
              <div className="mb-6 space-y-2">
                {record.items.map((item) => (
                  <DownloadButton key={item.id} productId={item.product_id} title={item.product?.title} />
                ))}
              </div>
            )}

            <Link
              to="/"
              className="inline-block rounded-lg bg-navy px-5 py-2.5 font-medium text-cream transition hover:bg-navy-light"
            >
              Go to dashboard
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-navy">Still processing</h1>
            <p className="mb-6 text-sm text-navy/60">
              Your payment is taking a little longer to confirm than usual. It should update shortly —
              check your dashboard in a moment.
            </p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-navy px-5 py-2.5 font-medium text-cream transition hover:bg-navy-light"
            >
              Go to dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-navy">Something went wrong</h1>
            <p className="mb-6 text-sm text-navy/60">
              We couldn't confirm your payment status right now. If you were charged, it will still be
              recorded — check your dashboard.
            </p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-navy px-5 py-2.5 font-medium text-cream transition hover:bg-navy-light"
            >
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}