import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('overview'); // overview | books | courses | bookings | availability

  const loadStats = () => api.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {});
  const loadBookings = () => api.get('/admin/bookings').then((res) => setBookings(res.data)).catch(() => {});

  useEffect(() => {
    loadStats();
    loadBookings();
  }, []);

  const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">Admin dashboard</h1>
      <p className="mb-8 text-sm text-navy/60">Manage books, courses, and bookings</p>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Books" value={stats.total_products} />
          <StatCard label="Courses" value={stats.total_courses} />
          <StatCard label="Pending bookings" value={stats.pending_bookings} />
          <StatCard label="Students" value={stats.total_students} />
          <StatCard label="Revenue" value={formatMoney(stats.revenue_cents)} />
        </div>
      )}

      <div className="mb-6 flex gap-2 border-b border-navy/10">
        {[
          ['overview', 'Overview'],
          ['books', 'Add a book'],
          ['courses', 'Add a course'],
          ['bookings', 'Bookings'],
          ['availability', 'Availability'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === key ? 'border-b-2 border-gold text-navy' : 'text-navy/50 hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          Use the tabs above to add books, add courses, or manage pending bookings.
        </div>
      )}

      {tab === 'books' && <AddBookForm />}
      {tab === 'courses' && <AddCourseForm />}
      {tab === 'bookings' && <BookingsList bookings={bookings} onUpdated={loadBookings} />}
      {tab === 'availability' && <AvailabilityManager />}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 text-center">
      <p className="font-display text-xl font-semibold text-navy">{value}</p>
      <p className="text-xs text-navy/50">{label}</p>
    </div>
  );
}

function AddBookForm() {
  const [form, setForm] = useState({ title: '', description: '', price_cents: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/products', {
        title: form.title,
        description: form.description,
        price_cents: Math.round(parseFloat(form.price_cents) * 100),
      });
      setCreated(res.data);
      toast.success('Book created — now upload the cover and file below');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create the book. Check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadCover = async () => {
    if (!coverFile || !created) return;
    const data = new FormData();
    data.append('cover', coverFile);
    try {
      await api.post(`/products/${created.id}/cover`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Cover uploaded');
    } catch {
      toast.error('Could not upload the cover image.');
    }
  };

  const uploadFile = async () => {
    if (!pdfFile || !created) return;
    const data = new FormData();
    data.append('file', pdfFile);
    try {
      await api.post(`/products/${created.id}/file`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Book file uploaded');
    } catch {
      toast.error('Could not upload the book file.');
    }
  };

  const reset = () => {
    setForm({ title: '', description: '', price_cents: '' });
    setCoverFile(null);
    setPdfFile(null);
    setCreated(null);
  };

  if (created) {
    return (
      <div className="rounded-xl border border-navy/10 bg-white p-6">
        <div className="mb-4 rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success">
          "{created.title}" created. Now add the cover image and the book file.
        </div>

        <label className="mb-1 block text-sm font-medium text-navy">Cover image</label>
        <div className="mb-2 flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
            className="flex-1 text-sm text-navy/70"
          />
          <button
            onClick={uploadCover}
            disabled={!coverFile}
            className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-cream disabled:opacity-40"
          >
            Upload
          </button>
        </div>

        <label className="mb-1 mt-4 block text-sm font-medium text-navy">Book file (PDF)</label>
        <div className="mb-4 flex gap-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="flex-1 text-sm text-navy/70"
          />
          <button
            onClick={uploadFile}
            disabled={!pdfFile}
            className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-cream disabled:opacity-40"
          >
            Upload
          </button>
        </div>

        <button onClick={reset} className="text-sm text-navy/50 hover:underline">
          + Add another book
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate} className="rounded-xl border border-navy/10 bg-white p-6">
      <label className="mb-1 block text-sm font-medium text-navy">Title</label>
      <input
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="mb-4 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
      />

      <label className="mb-1 block text-sm font-medium text-navy">Description</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        className="mb-4 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
      />

      <label className="mb-1 block text-sm font-medium text-navy">Price (USD)</label>
      <input
        required
        type="number"
        step="0.01"
        min="0.01"
        value={form.price_cents}
        onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
        className="mb-4 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create book'}
      </button>
    </form>
  );
}

function AddCourseForm() {
  const [form, setForm] = useState({ title: '', description: '', price_cents: '' });
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: '', video_id: '' });
  const [addingLesson, setAddingLesson] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/courses', {
        title: form.title,
        description: form.description,
        price_cents: Math.round(parseFloat(form.price_cents) * 100),
      });
      setCreated(res.data);
      toast.success('Course created — now add lessons below');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create the course. Check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setAddingLesson(true);
    try {
      const res = await api.post(`/courses/${created.id}/lessons`, {
        title: lessonForm.title,
        video_id: lessonForm.video_id || null,
        position: lessons.length + 1,
      });
      setLessons([...lessons, res.data]);
      setLessonForm({ title: '', video_id: '' });
      toast.success('Lesson added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add the lesson.');
    } finally {
      setAddingLesson(false);
    }
  };

  const reset = () => {
    setForm({ title: '', description: '', price_cents: '' });
    setCreated(null);
    setLessons([]);
    setLessonForm({ title: '', video_id: '' });
  };

  if (created) {
    return (
      <div className="rounded-xl border border-navy/10 bg-white p-6">
        <div className="mb-4 rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success">
          "{created.title}" created. Add lessons one at a time below.
        </div>

        {lessons.length > 0 && (
          <ul className="mb-4 space-y-1">
            {lessons.map((l, i) => (
              <li key={l.id} className="text-sm text-navy/70">
                {i + 1}. {l.title}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddLesson} className="rounded-lg border border-navy/10 bg-cream p-4">
          <label className="mb-1 block text-sm font-medium text-navy">Lesson title</label>
          <input
            required
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            className="mb-3 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-navy">
            Video ID <span className="font-normal text-navy/40">(optional for now — video hosting not wired up yet)</span>
          </label>
          <input
            value={lessonForm.video_id}
            onChange={(e) => setLessonForm({ ...lessonForm, video_id: e.target.value })}
            placeholder="e.g. a Cloudflare Stream or Mux ID, once available"
            className="mb-3 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
          />

          <button
            type="submit"
            disabled={addingLesson}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
          >
            {addingLesson ? 'Adding…' : '+ Add lesson'}
          </button>
        </form>

        <button onClick={reset} className="mt-4 text-sm text-navy/50 hover:underline">
          + Add another course
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate} className="rounded-xl border border-navy/10 bg-white p-6">
      <label className="mb-1 block text-sm font-medium text-navy">Title</label>
      <input
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="mb-4 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
      />

      <label className="mb-1 block text-sm font-medium text-navy">Description</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        className="mb-4 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
      />

      <label className="mb-1 block text-sm font-medium text-navy">Price (USD)</label>
      <input
        required
        type="number"
        step="0.01"
        min="0.01"
        value={form.price_cents}
        onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
        className="mb-4 w-full rounded-lg border border-navy/20 px-3 py-2 text-navy focus:border-gold focus:outline-none"
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create course'}
      </button>
    </form>
  );
}

function BookingsList({ bookings, onUpdated }) {
  const [updatingId, setUpdatingId] = useState(null);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update this booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div key={booking.id} className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">{booking.user?.name}</p>
              <p className="text-sm text-navy/60">{booking.user?.email}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                booking.status === 'pending'
                  ? 'bg-gold/10 text-gold'
                  : booking.status === 'approved'
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              }`}
            >
              {booking.status}
            </span>
          </div>
          <p className="mb-1 text-sm font-medium text-navy">
            {booking.coaching_service?.title || booking.package_enrollment?.programme?.title || 'General booking'}
          </p>
          <p className="mb-1 text-sm text-navy/70">
            {new Date(booking.starts_at).toLocaleString()}
            {booking.session_type && ` · ${booking.session_type}`}
            {booking.delivery_mode && ` · ${booking.delivery_mode}`}
            {!booking.package_enrollment_id && !booking.coaching_service_id && ` · ${booking.party_size} ${booking.party_size === 1 ? 'person' : 'people'}`}
          </p>
          {booking.notes && <p className="mb-3 text-sm text-navy/50">"{booking.notes}"</p>}

          {booking.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(booking.id, 'approved')}
                disabled={updatingId === booking.id}
                className="rounded-lg bg-success px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(booking.id, 'declined')}
                disabled={updatingId === booking.id}
                className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function AvailabilityManager() {
  const [rules, setRules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ruleForm, setRuleForm] = useState({ day_of_week: '1', start_time: '09:00', end_time: '17:00' });
  const [blockForm, setBlockForm] = useState({ starts_at: '', ends_at: '', reason: '' });
  const [submittingRule, setSubmittingRule] = useState(false);
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/availability/rules'),
      api.get('/admin/availability/blocks'),
    ])
      .then(([rulesRes, blocksRes]) => {
        setRules(rulesRes.data);
        setBlocks(blocksRes.data);
      })
      .catch(() => toast.error('Could not load availability.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addRule = async (e) => {
    e.preventDefault();
    setSubmittingRule(true);
    try {
      await api.post('/admin/availability/rules', {
        day_of_week: Number(ruleForm.day_of_week),
        start_time: ruleForm.start_time,
        end_time: ruleForm.end_time,
      });
      toast.success('Availability rule added');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add that rule.');
    } finally {
      setSubmittingRule(false);
    }
  };

  const toggleRule = async (rule) => {
    try {
      await api.patch(`/admin/availability/rules/${rule.id}`, { is_active: !rule.is_active });
      load();
    } catch {
      toast.error('Could not update that rule.');
    }
  };

  const deleteRule = async (id) => {
    try {
      await api.delete(`/admin/availability/rules/${id}`);
      toast.success('Rule removed');
      load();
    } catch {
      toast.error('Could not remove that rule.');
    }
  };

  const addBlock = async (e) => {
    e.preventDefault();
    setSubmittingBlock(true);
    try {
      await api.post('/admin/availability/blocks', blockForm);
      toast.success('Time blocked off');
      setBlockForm({ starts_at: '', ends_at: '', reason: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not block that time.');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const deleteBlock = async (id) => {
    try {
      await api.delete(`/admin/availability/blocks/${id}`);
      toast.success('Block removed');
      load();
    } catch {
      toast.error('Could not remove that block.');
    }
  };

  if (loading) {
    return <p className="text-sm text-navy/50">Loading availability…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-navy">Weekly hours</h2>
        <form onSubmit={addRule} className="mb-4 rounded-xl border border-navy/10 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <select
              value={ruleForm.day_of_week}
              onChange={(e) => setRuleForm({ ...ruleForm, day_of_week: e.target.value })}
              className="rounded-lg border border-navy/20 px-3 py-2"
            >
              {DAYS.map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={ruleForm.start_time}
              onChange={(e) => setRuleForm({ ...ruleForm, start_time: e.target.value })}
              className="rounded-lg border border-navy/20 px-3 py-2"
            />
            <input
              type="time"
              value={ruleForm.end_time}
              onChange={(e) => setRuleForm({ ...ruleForm, end_time: e.target.value })}
              className="rounded-lg border border-navy/20 px-3 py-2"
            />
            <button
              type="submit"
              disabled={submittingRule}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
            >
              {submittingRule ? 'Adding…' : '+ Add hours'}
            </button>
          </div>
        </form>

        {rules.length === 0 && <p className="text-sm text-navy/50">No weekly hours set yet.</p>}

        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-2.5">
              <span className={`text-sm ${rule.is_active ? 'text-navy' : 'text-navy/40 line-through'}`}>
                {DAYS[rule.day_of_week]} · {rule.start_time.slice(0, 5)}–{rule.end_time.slice(0, 5)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRule(rule)}
                  className="text-xs font-medium text-navy/60 hover:underline"
                >
                  {rule.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-xs font-medium text-error hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-navy">Blocked time</h2>
        <form onSubmit={addBlock} className="mb-4 space-y-3 rounded-xl border border-navy/10 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-navy/50">From</label>
              <input
                type="datetime-local"
                required
                value={blockForm.starts_at}
                onChange={(e) => setBlockForm({ ...blockForm, starts_at: e.target.value })}
                className="w-full rounded-lg border border-navy/20 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-navy/50">To</label>
              <input
                type="datetime-local"
                required
                value={blockForm.ends_at}
                onChange={(e) => setBlockForm({ ...blockForm, ends_at: e.target.value })}
                className="w-full rounded-lg border border-navy/20 px-3 py-2"
              />
            </div>
          </div>
          <input
            placeholder="Reason (optional)"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2"
          />
          <button
            type="submit"
            disabled={submittingBlock}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
          >
            {submittingBlock ? 'Blocking…' : '+ Block this time'}
          </button>
        </form>

        {blocks.length === 0 && <p className="text-sm text-navy/50">No blocked time.</p>}

        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-2.5">
              <span className="text-sm text-navy">
                {new Date(block.starts_at).toLocaleString()} – {new Date(block.ends_at).toLocaleString()}
                {block.reason && ` · ${block.reason}`}
              </span>
              <button
                onClick={() => deleteBlock(block.id)}
                className="text-xs font-medium text-error hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}