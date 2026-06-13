// src/pages/GuestPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GuestPage() {
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuth();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user || !isGuest()) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCivilStateDisplay = () => {
    if (!user.civil_state) return null;
    const civilStateMap = {
      'Célibataire': '⚬ Célibataire',
      'Marié': '💍 Marié',
      'Mariée': '💍 Mariée'
    };
    return civilStateMap[user.civil_state] || user.civil_state;
  };

  return (
    <div style={{ paddingTop: isMobile ? '80px' : '100px', minHeight: '100vh', background: '#f7f4ef' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        {/* Profile Header */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '20px' : '24px',
          marginBottom: isMobile ? '32px' : '48px',
          padding: isMobile ? '24px' : '32px',
          background: '#fff',
          borderRadius: 20,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '24px', width: '100%' }}>
            <div style={{
              width: isMobile ? '56px' : '72px',
              height: isMobile ? '56px' : '72px',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              border: '2px solid rgba(201,168,76,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '24px' : '28px',
              color: '#c9a84c',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#c9a84c', fontSize: isMobile ? '10px' : '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Guest Account</div>
              <div style={{ color: '#1a1a2e', fontSize: isMobile ? '18px' : '22px', fontWeight: 700 }}>{user.full_name}</div>
              <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: isMobile ? '12px' : '13px', marginTop: 2 }}>{user.email}</div>
              {getCivilStateDisplay() && (
                <div style={{ 
                  color: '#c9a84c', 
                  fontSize: isMobile ? '11px' : '12px', 
                  marginTop: 6,
                  display: 'inline-block',
                  background: 'rgba(201,168,76,0.1)',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontWeight: 500
                }}>
                  {getCivilStateDisplay()}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(220,50,50,0.08)',
              border: '1px solid rgba(220,50,50,0.25)',
              color: '#e05555',
              borderRadius: 10,
              padding: isMobile ? '8px 16px' : '9px 18px',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,50,50,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,50,50,0.08)'; }}
          >
            🚪 Sign Out
          </button>
        </div>

        {/* Action Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'), 
          gap: isMobile ? '12px' : '16px' 
        }}>
          {[
            { icon: '🏠', label: 'Browse Stays', sub: 'Find your next stay', to: '/stays' },
            { icon: '❤️', label: 'My Wishlist', sub: 'Your saved properties', to: '/wishlist' },
            { icon: '📅', label: 'My Bookings', sub: 'View booking history', to: '/bookings' },
            { icon: '✏️', label: 'Edit Profile', sub: 'Update your info', to: '/profile' },
          ].map(({ icon, label, sub, to }) => (
            <Link
              key={label}
              to={to}
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 16,
                padding: isMobile ? '20px 16px' : '28px 20px',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: isMobile ? '28px' : '34px', marginBottom: isMobile ? '8px' : '12px' }}>{icon}</div>
              <div style={{ color: '#1a1a2e', fontSize: isMobile ? '14px' : '15px', fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: isMobile ? '11px' : '12px' }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuestPage;