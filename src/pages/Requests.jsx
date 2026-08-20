import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const TYPES = [
  { value: 'requisition', label: 'Requisition' },
  { value: 'graduation', label: 'Graduation registration' },
  { value: 'teacher_evaluation', label: 'Teacher evaluation' },
  { value: 'client_evaluation', label: 'Client evaluation' },
];

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: 'requisition', subject: '', details: '' });

  const load = () => {
    setLoading(true);
    api.get('/requests')
      .then((res) => setRequests(res.data))
      .catch(() => toast.error('Could not load your requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/requests', form);
      toast.success('Request submitted');
      setForm({ type: 'requisition', subject: '', details: '' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit that request.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status) => ({
    pending: 'bg-gold/10 text-gold',
    in_review: 'bg-navy/10 text-navy',
    resolved: 'bg-success/10 text-success',
    declined: 'bg-error/10 text-error',
  }[status] || 'bg-navy/10 text-navy/60');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Requests</h1>
          <p className="text-sm text-navy/60">Requisitions, graduation registration, and evaluations</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
        >
          {showForm ? 'Cancel' : '+ New request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            required
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2"
          />
          <textarea
            placeholder="Details (optional)"
            rows={3}
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-navy/50">Loading…</p>}

      {!loading && requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-6 text-center text-sm text-navy/50">
          No requests yet.
        </div>
      )}

      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-navy/40">
                {TYPES.find((t) => t.value === r.type)?.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(r.status)}`}>
                {r.status.replace('_', ' ')}
              </span>
            </div>
            <p className="font-medium text-navy">{r.subject}</p>
            {r.details && <p className="mt-1 text-sm text-navy/60">{r.details}</p>}
            {r.admin_response && (
              <div className="mt-2 rounded-lg bg-cream p-2 text-sm text-navy/70">
                <span className="font-medium">Response: </span>{r.admin_response}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}