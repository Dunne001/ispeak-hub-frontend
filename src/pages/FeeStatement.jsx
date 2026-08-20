
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function FeeStatement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fee-statement')
      .then((res) => setPayments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const formatAmount = (p) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: (p.currency || 'kes').toUpperCase() }).format(p.amount_cents / 100);

  const total = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Fee statement</h1>
          <p className="text-sm text-navy/60">All your payments and receipts</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
        >
          <Download size={16} /> Download
        </button>
      </div>

      {loading && <p className="text-sm text-navy/50">Loading…</p>}

      {!loading && (
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm print:rounded-none print:border-navy/30 print:shadow-none">
          <div className="mb-6 flex items-start justify-between border-b border-navy/10 pb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy">iSpeak Academy</h2>
              <p className="text-xs text-navy/50">Official fee statement</p>
            </div>
            <div className="text-right text-sm text-navy/60">
              <p className="font-medium text-navy">{user?.name}</p>
              <p>{user?.email}</p>
              <p>Issued {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-6 text-center text-sm text-navy/50 print:hidden">
              No payments on record yet.
            </div>
          ) : (
            <>
              <table className="mb-6 w-full text-sm">
                <thead className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-navy/40">
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2">Reference</th>
                    <th className="py-2">Provider</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-navy/5 last:border-0">
                      <td className="py-2 text-navy/70">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-2 text-navy/50">{p.reference}</td>
                      <td className="py-2 capitalize text-navy/70">{p.provider}</td>
                      <td className="py-2 text-right font-medium text-navy">{formatAmount(p)}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.status === 'confirmed'
                              ? 'bg-success/10 text-success'
                              : p.status === 'pending'
                              ? 'bg-gold/10 text-gold'
                              : 'bg-error/10 text-error'
                          } print:bg-transparent print:px-0`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end border-t border-navy/10 pt-4">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-navy/40">Total confirmed paid</p>
                  <p className="font-display text-2xl font-semibold text-navy">
                    KES {(total / 100).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}