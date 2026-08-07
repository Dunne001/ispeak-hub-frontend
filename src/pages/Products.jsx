import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Products() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products right now. Try refreshing the page.'))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (cents, currency) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  const handleBuy = async (product) => {
    if (authLoading) {
      return;
    }

    if (!user) {
      toast('Sign in to buy this book', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setBuyingId(product.id);
    try {
      const orderRes = await api.post('/orders', {
        items: [{ product_id: product.id, quantity: 1 }],
      });
      const order = orderRes.data;

      const checkoutRes = await api.post(`/orders/${order.id}/checkout`);
      window.location.href = checkoutRes.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start checkout. Please try again.');
      setBuyingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-navy">Books</h1>
      <p className="mb-8 text-sm text-navy/60">Guides and resources from iSpeak Academy</p>

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

      {!loading && !error && products.length === 0 && (
        <div className="rounded-xl border border-navy/10 bg-white p-8 text-center text-navy/60">
          No books available yet. Check back soon.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-xl border border-navy/10 bg-white transition hover:shadow-lg"
          >
            <div className="flex h-40 items-center justify-center bg-navy/5">
              {product.cover_image_url ? (
                <img
                  src={product.cover_image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex gap-1">
                  {[6, 10, 14, 10, 6].map((h, i) => (
                    <span key={i} className="w-1 rounded-full bg-gold/40" style={{ height: `${h}px` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="mb-1 font-display text-lg font-semibold text-navy">{product.title}</h2>
              <p className="mb-3 line-clamp-2 text-sm text-navy/60">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold">
                  {formatPrice(product.price_cents, product.currency)}
                </span>
                <button
                  onClick={() => handleBuy(product)}
                  disabled={buyingId === product.id || authLoading}
                  className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-cream transition hover:bg-navy-light disabled:opacity-50"
                >
                  {buyingId === product.id ? 'Starting…' : 'Buy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}