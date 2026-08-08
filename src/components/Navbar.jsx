import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-navy text-cream px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-wide">
        <span className="flex gap-[3px] items-end h-5">
          <span className="w-1 h-2 bg-gold rounded-full"></span>
          <span className="w-1 h-4 bg-gold rounded-full"></span>
          <span className="w-1 h-5 bg-gold rounded-full"></span>
          <span className="w-1 h-3 bg-gold rounded-full"></span>
          <span className="w-1 h-2 bg-gold rounded-full"></span>
        </span>
        iSpeak Hub
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/products" className="hover:text-gold-light transition-colors">Bookstore</Link>
        <Link to="/bookings" className="hover:text-gold-light transition-colors">Bookings</Link>
        <Link to="/courses" className="hover:text-gold-light transition-colors">Courses</Link>

        {loading ? null : user ? (
          <>
            <span className="text-cream/60">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="border border-gold text-gold px-3 py-1 rounded hover:bg-gold hover:text-navy transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gold-light transition-colors">Log in</Link>
            <Link
              to="/register"
              className="bg-gold text-navy px-3 py-1 rounded font-semibold hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}