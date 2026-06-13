// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar({ scrolled, onOpenModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isHost, isGuest, logout } = useAuth();

  // Don't show navbar on host dashboard
  if (location.pathname === '/host-dashboard') {
    return null;
  }

  const handleHostDashboardClick = () => {
    navigate('/host-dashboard');
  };

  const handleGuestProfileClick = () => {
    navigate('/guest');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    if (window.showToast) window.showToast('👋 Logged out successfully');
  };

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <Link to="/" className="nav-logo">
        <span className="logo-icon">
          <img src="/photos/logo2.png" alt="MyHomeCity Logo" className="logo-img" />
        </span>
        Mabiti'<span>i</span>
      </Link>
      <ul className="nav-links">
        <li><Link to="/stays" className={location.pathname === '/Booking' ? 'active-link' : ''}>Booking</Link></li>
        <li><Link to="/destinations" className={location.pathname === '/destinations' ? 'active-link' : ''}>Destinations</Link></li>
        <li><Link to="/experiences" className={location.pathname === '/experiences' ? 'active-link' : ''}>Experiences</Link></li>
        <li><Link to="/host" className={location.pathname === '/host' ? 'active-link' : ''}>Host</Link></li>
      </ul>
      <div className="nav-actions">
        {user ? (
          <>
            {isHost() && (
              <button className="btn-primary" onClick={handleHostDashboardClick}>
                📊 Dashboard
              </button>
            )}
            {isGuest() && (
              <button 
                className="btn-primary" 
                onClick={handleGuestProfileClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                👤 Profile
              </button>
            )}
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn-ghost" onClick={onOpenModal}>Sign In</button>
            <button className="btn-primary" onClick={onOpenModal}>Join Free</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;