import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-navy text-cream px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 font-display text-lg sm:text-xl font-semibold tracking-wide">
          <span className="flex gap-[3px] items-end h-5">
            <span className="w-1 h-2 bg-gold rounded-full"></span>
            <span className="w-1 h-4 bg-gold rounded-full"></span>
            <span className="w-1 h-5 bg-gold rounded-full"></span>
            <span className="w-1 h-3 bg-gold rounded-full"></span>
            <span className="w-1 h-2 bg-gold rounded-full"></span>
          </span>
          iSpeak Hub
        </Link>

        {/* Desktop links — hidden on small screens */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
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

        {/* Hamburger button — only visible below md */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-cream transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-cream transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-cream transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 pb-2 text-sm font-medium">
          <Link to="/products" onClick={closeMenu} className="hover:text-gold-light transition-colors">Bookstore</Link>
          <Link to="/bookings" onClick={closeMenu} className="hover:text-gold-light transition-colors">Bookings</Link>
          <Link to="/courses" onClick={closeMenu} className="hover:text-gold-light transition-colors">Courses</Link>

          {loading ? null : user ? (
            <>
              <span className="text-cream/60">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="border border-gold text-gold px-3 py-2 rounded hover:bg-gold hover:text-navy transition-colors text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="hover:text-gold-light transition-colors">Log in</Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="bg-gold text-navy px-3 py-2 rounded font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}