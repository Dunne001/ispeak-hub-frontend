import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CoursePlayer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then((res) => setLesson(res.data))
      .catch((err) =>
        setError(
          err.response?.status === 403
            ? "You need to be enrolled in this course to watch this lesson."
            : 'Could not load this lesson right now.'
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    setMarking(true);
    try {
      await api.post(`/lessons/${id}/complete`);
      setLesson((prev) => ({ ...prev, completed: true }));
      toast.success('Marked as complete');
    } catch {
      toast.error('Could not update progress. Please try again.');
    } finally {
      setMarking(false);
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

  if (error || !lesson) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-error">
          {error || 'Lesson not found.'}
        </div>
        <Link to="/courses" className="mt-4 inline-block text-sm text-navy/60 hover:underline">
          ← Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 font-display text-2xl font-semibold text-navy">{lesson.title}</h1>

      <div className="mb-6 flex aspect-video items-center justify-center rounded-xl border border-navy/10 bg-navy text-cream/50">
        <div className="text-center">
          <div className="mb-2 flex justify-center gap-1">
            {[6, 10, 14, 10, 6].map((h, i) => (
              <span key={i} className="w-1 rounded-full bg-gold/50" style={{ height: `${h}px` }} />
            ))}
          </div>
          <p className="text-sm">Video: {lesson.video_id || 'not yet uploaded'}</p>
        </div>
      </div>

      <button
        onClick={handleComplete}
        disabled={marking || lesson.completed}
        className="rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
      >
        {lesson.completed ? '✓ Completed' : marking ? 'Saving…' : 'Mark as complete'}
      </button>
    </div>
  );
}