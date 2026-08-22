import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

export default function PaymentModal({ type, id, onClose, onConfirmed }) {
  const [step, setStep] = useState('choose'); // choose | phone | waiting | confirmed | failed
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pollAttemptRef = useRef(0);
  const enrollmentIdRef = useRef(type === 'programme-balance' ? id : null);

  const checkoutPath =
    type === 'order' ? `/orders/${id}/checkout`
    : type === 'course' ? `/courses/${id}/checkout`
    : type === 'programme' ? `/programmes/${id}/checkout`
    : type === 'programme-balance' ? `/package-enrollments/${id}/balance/checkout`
    : `/bookings/${id}/checkout`;

  const mpesaPath =
    type === 'order' ? `/orders/${id}/mpesa`
    : type === 'course' ? `/courses/${id}/mpesa`
    : type === 'programme' ? `/programmes/${id}/mpesa`
    : type === 'programme-balance' ? `/package-enrollments/${id}/balance/mpesa`
    : `/bookings/${id}/mpesa`;

  const statusPath = () =>
    type === 'order' ? `/orders/${id}`
    : type === 'course' ? `/courses/${id}`
    : type === 'programme' ? `/package-enrollments/${enrollmentIdRef.current}`
    : type === 'programme-balance' ? `/package-enrollments/${id}`
    : `/bookings/${id}`;

  const handleCard = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(checkoutPath);
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Could not start checkout. Please try again.');
      setSubmitting(false);
    }
  };

  const handleMpesaSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(mpesaPath, { phone });
      if (type === 'programme') {
        enrollmentIdRef.current = res.data.enrollment_id;
      }
      setStep('waiting');
      pollAttemptRef.current += 1;
      poll(pollAttemptRef.current);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Could not start M-Pesa payment. Please try again.');
      setSubmitting(false);
    }
  };

  const poll = (attemptId) => {
    let attempts = 0;
    const startingBalance = type === 'programme-balance' ? null : null;

    const check = async () => {
      if (attemptId !== pollAttemptRef.current) {
        return; // a newer attempt superseded this one, stop silently
      }

      try {
        const res = await api.get(statusPath());

        if (attemptId !== pollAttemptRef.current) return;

        const isPaid =
          type === 'order' ? res.data.status === 'paid'
          : type === 'course' ? res.data.is_enrolled === true
          : type === 'programme' ? res.data.status === 'active'
          : type === 'programme-balance' ? (res.data.progress?.balance_remaining_cents ?? 1) <= 0
          : res.data.payments?.some((p) => p.status === 'confirmed');

        if (isPaid) {
          setStep('confirmed');
          onConfirmed?.();
          return;
        }

        attempts += 1;

        if (type === 'course') {
          if (res.data.latest_payment_status === 'failed' && attempts > 3) {
            setStep('failed');
            return;
          }
        } else if (type !== 'programme' && type !== 'programme-balance') {
          const latestPayment = [...(res.data.payments || [])].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )[0];
          const failed = latestPayment?.status === 'failed';

          if (failed && attempts > 3) {
            setStep('failed');
            return;
          }
        }

        if (attempts >= MAX_POLLS) {
          setStep('failed');
          return;
        }

        setTimeout(check, POLL_INTERVAL_MS);
      } catch {
        if (attemptId === pollAttemptRef.current) {
          setTimeout(check, POLL_INTERVAL_MS);
        }
      }
    };

    check();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6">
        {step === 'choose' && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-navy">Choose payment method</h2>
            <div className="space-y-3">
              <button
                onClick={handleCard}
                disabled={submitting}
                className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
              >
                Pay with card
              </button>
              <button
                onClick={() => setStep('phone')}
                className="w-full rounded-lg border border-gold bg-gold/10 px-4 py-2.5 font-medium text-navy transition hover:bg-gold/20"
              >
                Pay with M-Pesa
              </button>
            </div>
            <button onClick={onClose} className="mt-4 w-full text-center text-sm text-navy/50 hover:underline">
              Cancel
            </button>
          </>
        )}

        {step === 'phone' && (
          <form onSubmit={handleMpesaSubmit}>
            <h2 className="mb-1 text-lg font-semibold text-navy">Pay with M-Pesa</h2>
            <p className="mb-4 text-sm text-navy/60">Enter the phone number to receive the payment prompt.</p>
            <input
              type="tel"
              required
              placeholder="2547XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-4 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send payment prompt'}
            </button>
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="mt-3 w-full text-center text-sm text-navy/50 hover:underline"
            >
              Back
            </button>
          </form>
        )}

        {step === 'waiting' && (
          <div className="text-center">
            <div className="mb-4 flex justify-center gap-1">
              {[8, 14, 20, 14, 8].map((h, i) => (
                <span
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-gold"
                  style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <h2 className="mb-1 text-lg font-semibold text-navy">Check your phone</h2>
            <p className="text-sm text-navy/60">Enter your M-Pesa PIN on the prompt to complete payment.</p>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="text-center">
            <h2 className="mb-1 text-lg font-semibold text-navy">Payment confirmed</h2>
            <p className="mb-4 text-sm text-navy/60">Thank you — your payment went through.</p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light"
            >
              Done
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center">
            <h2 className="mb-1 text-lg font-semibold text-navy">Payment not completed</h2>
            <p className="mb-4 text-sm text-navy/60">
              We didn't receive confirmation in time. If you entered your PIN, check your dashboard —
              otherwise, try again.
            </p>
            <button
              onClick={() => setStep('choose')}
              className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
