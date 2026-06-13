// src/pages/HostPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HostPage({ showToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isHost } = useAuth();
  const [hasShownToast, setHasShownToast] = useState(false);

  // Redirect to dashboard if already logged in as host
  useEffect(() => {
    if (user && isHost()) {
      navigate('/host-dashboard');
    }
  }, [user, isHost, navigate]);

  // Handle login required message from protected route
  useEffect(() => {
    // Check if we came from a protected route that requires login
    if (location.state?.needLogin && !hasShownToast && !user) {
      setHasShownToast(true);
      showToast('🔑 Please login as a host first');
      // Clear the state to prevent showing again
      navigate('/host', { replace: true, state: {} });
    }
  }, [location, hasShownToast, showToast, navigate, user]);

  const handleStartHosting = () => {
    navigate('/host/login');
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'var(--navy)',
        paddingTop: '140px',
        paddingBottom: '60px',
        textAlign: 'center',
        color: 'var(--white)'
      }}>
        <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)' }}>Become a Host</div>
        <h1 className="section-title" style={{ color: 'var(--white)', textAlign: 'center' }}>
          Your Space Could Be<br />Someone's <em>Dream</em>.
        </h1>
        <p className="section-sub" style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '520px', margin: '16px auto 0' }}>
          Turn your empty rooms or entire home into a welcoming getaway — and earn meaningful income doing it.
        </p>
        <button
          className="btn-gold"
          style={{ marginTop: '40px' }}
          onClick={handleStartHosting}
        >
          Start Hosting Today
        </button>
      </div>

      {/* Main Host Section */}
      <section className="host-section" id="host" style={{ paddingTop: '80px' }}>
        <div className="host-content fade-up">
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-title">Three Steps to<br /><em>Earning</em>.</h2>
          <p className="section-sub">We've made it simple to list your space and start welcoming guests from around the world.</p>
          <div className="host-steps">
            <div className="host-step">
              <div className="step-num">01</div>
              <div className="step-info">
                <h4>List Your Space</h4>
                <p>Set up your listing in minutes with our guided onboarding — photos, amenities, pricing.</p>
              </div>
            </div>
            <div className="host-step">
              <div className="step-num">02</div>
              <div className="step-info">
                <h4>Get Verified</h4>
                <p>Our team reviews and verifies your listing to ensure it meets NestAway quality standards.</p>
              </div>
            </div>
            <div className="host-step">
              <div className="step-num">03</div>
              <div className="step-info">
                <h4>Start Earning</h4>
                <p>Welcome guests and watch the earnings roll in — we handle payments, support, and more.</p>
              </div>
            </div>
          </div>
          <button className="btn-navy" onClick={handleStartHosting}>
            Start Hosting
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="host-img-wrap fade-up">
          <img src="/photos/hostpage.jpg" alt="Host" className="host-img" />
          <div className="host-earn-badge">
            <div className="host-earn-num">$3,200</div>
            <div className="host-earn-label">avg. monthly</div>
          </div>
        </div>
      </section>

      {/* Host Benefits */}
      <section style={{ background: 'var(--navy)', padding: '80px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)' }}>Why NestAway</div>
          <h2 className="section-title" style={{ color: 'var(--white)', textAlign: 'center', marginBottom: '60px' }}>
            Built for <em>Hosts</em>.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            {[
              { icon: '💰', title: 'Competitive Payouts', desc: 'Keep up to 97% of your earnings. We only take a small service fee per booking.' },
              { icon: '🛡️', title: '$1M Host Protection', desc: 'Every property is covered by our comprehensive host guarantee program.' },
              { icon: '📊', title: 'Smart Pricing Tools', desc: 'Our AI-powered pricing engine helps you maximize revenue year-round.' },
              { icon: '💬', title: '24/7 Host Support', desc: 'Dedicated support team available around the clock whenever you need help.' },
            ].map((b) => (
              <div key={b.title} className="editorial-feature fade-up" style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius)',
                padding: '32px',
                border: '1px solid rgba(201,168,76,0.15)',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                <div className="editorial-feature-icon" style={{ fontSize: '36px' }}>{b.icon}</div>
                <div>
                  <h4 style={{ color: 'var(--white)', marginBottom: '8px' }}>{b.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default HostPage;