// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const socials = [
  { label: 'X', icon: '🐦' },
  { label: 'Instagram', icon: '📸' },
  { label: 'Facebook', icon: '📘' },
  { label: 'YouTube', icon: '▶️' },
];

function Footer({ showToast }) {
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

  return (
    <footer style={{ background: '#0B1426', color: '#fff', paddingTop: '60px' }}>
      <div className="footer-grid" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 20px' : '0 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
        gap: isMobile ? '32px' : '40px',
        marginBottom: '48px'
      }}>
        <div className="footer-brand">
          <Link to="/" className="nav-logo" style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <span className="logo-icon">
              <img src="/photos/logo2.png" alt="MyHomeCity Logo" className="logo-img" style={{ width: '40px', height: '40px' }} />
            </span>
            <span style={{ color: '#C9A84C', fontSize: isMobile ? '20px' : '24px', fontWeight: 700 }}>
              Mabiti'<span style={{ color: '#fff' }}>i</span>
            </span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontSize: isMobile ? '13px' : '14px', marginBottom: '20px' }}>
            Connecting Algerians with homes across every wilaya — short stays, long stays, and everything in between. Pay easily in Dinar.
          </p>
          <div className="footer-socials" style={{ display: 'flex', gap: '12px' }}>
            {socials.map(({ label, icon }) => (
              <button
                key={label}
                className="social-btn"
                onClick={() => showToast(`Opening ${label}...`)}
                aria-label={label}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: isMobile ? '36px' : '40px',
                  height: isMobile ? '36px' : '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: isMobile ? '18px' : '20px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h5 style={{ color: '#C9A84C', fontSize: isMobile ? '14px' : '16px', marginBottom: '16px', fontWeight: 600 }}>Explore</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px' }}><Link to="/stays" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px', transition: 'color 0.2s' }}>All Listings</Link></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Short-term Stays</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Long-term Rentals</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Seaside Properties</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Sahara Experiences</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5 style={{ color: '#C9A84C', fontSize: isMobile ? '14px' : '16px', marginBottom: '16px', fontWeight: 600 }}>Hosting</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px' }}><Link to="/host" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>List Your Home</Link></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Host Guide</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Baridi Mob Payments</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Host Community</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Help Center</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5 style={{ color: '#C9A84C', fontSize: isMobile ? '14px' : '16px', marginBottom: '16px', fontWeight: 600 }}>Company</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px' }}><Link to="/about" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>About Mabit'i</Link></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Our Mission</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Trust & Safety</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Press</a></li>
            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: isMobile ? '13px' : '14px' }}>Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom" style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: isMobile ? '20px' : '24px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: isMobile ? '16px' : '0'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: isMobile ? '11px' : '12px' }}>
          © 2026 Mabit'i. All rights reserved. — Made in Algeria
        </span>
        <div className="footer-bottom-links" style={{
          display: 'flex',
          gap: isMobile ? '16px' : '24px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: isMobile ? '11px' : '12px' }}>Privacy</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: isMobile ? '11px' : '12px' }}>Terms</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: isMobile ? '11px' : '12px' }}>Legal Notice</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: isMobile ? '11px' : '12px' }}>Cookies</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;