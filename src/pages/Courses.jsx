import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

export default function Courses() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCourseId, setActiveCourseId] = useState(null);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => setError('Could not load courses right now. Try refreshing the page.'))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  const handleEnroll = (course) => {
    if (authLoading) return;

    if (!user) {
      toast('Sign in to enroll in this course', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setActiveCourseId(course.id);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Courses</h1>
      <p className="mb-8 text-sm text-navy/60">Learn directly from iSpeak Academy</p>

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

      {!loading && !error && courses.length === 0 && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          No courses available yet. Check back soon.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="overflow-hidden rounded-xl border border-navy/10 bg-white transition hover:shadow-lg"
          >
            <div className="p-4">
              <h2 className="mb-1 font-display text-lg font-semibold text-navy">{course.title}</h2>
              <p className="mb-3 line-clamp-2 text-sm text-navy/60">{course.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold">
                  {formatPrice(course.price_cents, course.currency)}
                </span>
                <div className="flex gap-2">
                  <Link
                    to={`/courses/${course.id}`}
                    className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm font-medium text-navy transition hover:bg-navy/5"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={authLoading}
                    className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeCourseId && (
        <PaymentModal
          type="course"
          id={activeCourseId}
          onClose={() => setActiveCourseId(null)}
          onConfirmed={() => {
            toast.success('Enrolled successfully');
          }}
        />
      )}
    </div>
  );
}