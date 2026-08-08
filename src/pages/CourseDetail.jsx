import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PaymentModal from '../components/PaymentModal';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => setError('Could not load this course right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

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

  if (error || !course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center text-error">
          {error || 'Course not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 font-display text-2xl font-semibold text-navy">{course.title}</h1>
      <p className="mb-6 text-navy/60">{course.description}</p>

      {!course.is_enrolled && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 p-4">
          <span className="font-medium text-navy">
            {formatPrice(course.price_cents, course.currency)}
          </span>
          <button
            onClick={() => setShowPayment(true)}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream transition hover:bg-navy-light"
          >
            Enroll now
          </button>
        </div>
      )}

      {course.is_enrolled && (
        <div className="mb-6 rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success">
          You're enrolled in this course
        </div>
      )}

      <h2 className="mb-3 font-display text-lg font-semibold text-navy">Lessons</h2>
      <div className="space-y-2">
        {course.lessons?.length === 0 && (
          <p className="text-sm text-navy/50">No lessons published yet.</p>
        )}
        {course.lessons?.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-3"
          >
            <span className="text-navy">{lesson.title}</span>
            {course.is_enrolled ? (
              <Link
                to={`/lessons/${lesson.id}`}
                className="text-sm font-medium text-gold hover:underline"
              >
                Watch →
              </Link>
            ) : (
              <span className="text-sm text-navy/30">🔒 Locked</span>
            )}
          </div>
        ))}
      </div>

      {showPayment && (
        <PaymentModal
          type="course"
          id={course.id}
          onClose={() => setShowPayment(false)}
          onConfirmed={() => {
            toast.success('Enrolled successfully');
            load();
          }}
        />
      )}
    </div>
  );
}