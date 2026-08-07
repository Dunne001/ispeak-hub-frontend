import { Link } from 'react-router-dom';

export default function CheckoutCancel() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-semibold text-navy">Checkout cancelled</h1>
        <p className="mb-6 text-sm text-navy/60">
          No payment was made. You can try again whenever you're ready.
        </p>
        <Link
          to="/products"
          className="inline-block rounded-lg bg-navy px-5 py-2.5 font-medium text-cream transition hover:bg-navy-light"
        >
          Back to books
        </Link>
      </div>
    </div>
  );
}