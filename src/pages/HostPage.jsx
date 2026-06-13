// src/pages/HostPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HostPage({ showToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isHost } = useAuth();
  const [hasShownToast, setHasShownToast] = useState(false);
  
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

  useEffect(() => {
    if (user && isHost()) {
      navigate('/host-dashboard');
    }
  }, [user, isHost, navigate]);

  useEffect(() => {
    if (location.state?.needLogin && !hasShownToast && !user) {
      setHasShownToast(true);
      showToast('🔑 Please login as a host first');
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
        paddingTop: isMobile ? '100px' : '140px',
        paddingBottom: isMobile ? '40px' : '60px',
        paddingLeft: isMobile ? '20px' : '0',
        paddingRight: isMobile ? '20px' : '0',
        textAlign: 'center',
        color: 'var(--white)'
      }}>
        <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)', fontSize: isMobile ? '12px' : '14px' }}>Become a Host</div>
        <h1 className="section-title" style={{ 
          color: 'var(--white)', 
          textAlign: 'center', 
          fontSize: isMobile ? 'clamp(28px, 6vw, 42px)' : 'clamp(36px, 5vw, 56px)',
          padding: isMobile ? '0 16px' : '0'
        }}>
          Your Space Could Be<br />Someone's <em>Dream</em>.
        </h1>
        <p className="section-sub" style={{ 
          color: 'rgba(255,255,255,0.5)', 
          textAlign: 'center', 
          maxWidth: isMobile ? '90%' : '520px', 
          margin: '16px auto 0',
          fontSize: isMobile ? '14px' : '16px',
          padding: isMobile ? '0 16px' : '0'
        }}>
          Turn your empty rooms or entire home into a welcoming getaway — and earn meaningful income doing it.
        </p>
        <button
          className="btn-gold"
          style={{ 
            marginTop: isMobile ? '30px' : '40px',
            padding: isMobile ? '12px 28px' : '14px 36px',
            fontSize: isMobile ? '14px' : '16px'
          }}
          onClick={handleStartHosting}
        >
          Start Hosting Today
        </button>
      </div>

      {/* Main Host Section */}
      <section className="host-section" id="host" style={{ 
        paddingTop: isMobile ? '40px' : '80px',
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : 'row',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '40px' : '60px',
        padding: isMobile ? '40px 20px' : '80px 48px'
      }}>
        <div className="host-content fade-up">
          <div className="section-eyebrow" style={{ fontSize: isMobile ? '12px' : '14px' }}>How It Works</div>
          <h2 className="section-title" style={{ fontSize: isMobile ? 'clamp(28px, 5vw, 36px)' : 'clamp(36px, 4vw, 48px)' }}>
            Three Steps to<br /><em>Earning</em>.
          </h2>
          <p className="section-sub" style={{ fontSize: isMobile ? '14px' : '16px' }}>
            We've made it simple to list your space and start welcoming guests from around the world.
          </p>
          <div className="host-steps">
            {[
              { num: '01', title: 'List Your Space', desc: 'Set up your listing in minutes with our guided onboarding — photos, amenities, pricing.' },
              { num: '02', title: 'Get Verified', desc: 'Our team reviews and verifies your listing to ensure it meets NestAway quality standards.' },
              { num: '03', title: 'Start Earning', desc: 'Welcome guests and watch the earnings roll in — we handle payments, support, and more.' }
            ].map((step, idx) => (
              <div key={idx} className="host-step" style={{ 
                display: 'flex', 
                gap: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? '24px' : '32px',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center'
              }}>
                <div className="step-num" style={{ 
                  width: isMobile ? '48px' : '56px',
                  height: isMobile ? '48px' : '56px',
                  fontSize: isMobile ? '20px' : '24px'
                }}>{step.num}</div>
                <div className="step-info">
                  <h4 style={{ fontSize: isMobile ? '18px' : '20px' }}>{step.title}</h4>
                  <p style={{ fontSize: isMobile ? '14px' : '15px' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-navy" onClick={handleStartHosting} style={{
            padding: isMobile ? '12px 24px' : '14px 32px',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            Start Hosting
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginLeft: '8px' }}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="host-img-wrap fade-up" style={{ position: 'relative' }}>
          <img 
            src="/photos/hostpage.jpg" 
            alt="Host" 
            className="host-img" 
            style={{ 
              width: '100%', 
              borderRadius: '20px',
              height: isMobile ? 'auto' : 'auto'
            }} 
          />
          <div className="host-earn-badge" style={{
            position: 'absolute',
            bottom: isMobile ? '20px' : '30px',
            right: isMobile ? '20px' : '30px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: isMobile ? '12px 20px' : '16px 24px',
            textAlign: 'center'
          }}>
            <div className="host-earn-num" style={{ 
              fontSize: isMobile ? '24px' : '28px', 
              fontWeight: 700, 
              color: '#c9a84c' 
            }}>$3,200</div>
            <div className="host-earn-label" style={{ 
              fontSize: isMobile ? '11px' : '12px', 
              color: '#666' 
            }}>avg. monthly</div>
          </div>
        </div>
      </section>

      {/* Host Benefits */}
      <section style={{ 
        background: 'var(--navy)', 
        padding: isMobile ? '40px 20px' : '80px 48px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ 
            justifyContent: 'center', 
            color: 'var(--gold)',
            fontSize: isMobile ? '12px' : '14px'
          }}>Why NestAway</div>
          <h2 className="section-title" style={{ 
            color: 'var(--white)', 
            textAlign: 'center', 
            marginBottom: isMobile ? '40px' : '60px',
            fontSize: isMobile ? 'clamp(28px, 5vw, 36px)' : 'clamp(36px, 4vw, 48px)'
          }}>
            Built for <em>Hosts</em>.
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'), 
            gap: isMobile ? '20px' : '32px' 
          }}>
            {[
              { icon: '💰', title: 'Competitive Payouts', desc: 'Keep up to 97% of your earnings. We only take a small service fee per booking.' },
              { icon: '🛡️', title: '$1M Host Protection', desc: 'Every property is covered by our comprehensive host guarantee program.' },
              { icon: '📊', title: 'Smart Pricing Tools', desc: 'Our AI-powered pricing engine helps you maximize revenue year-round.' },
              { icon: '💬', title: '24/7 Host Support', desc: 'Dedicated support team available around the clock whenever you need help.' },
            ].map((b) => (
              <div key={b.title} className="editorial-feature fade-up" style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius)',
                padding: isMobile ? '24px' : '32px',
                border: '1px solid rgba(201,168,76,0.15)',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                textAlign: 'left'
              }}>
                <div className="editorial-feature-icon" style={{ fontSize: isMobile ? '32px' : '36px' }}>{b.icon}</div>
                <div>
                  <h4 style={{ color: 'var(--white)', marginBottom: '8px', fontSize: isMobile ? '16px' : '18px' }}>{b.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', fontSize: isMobile ? '13px' : '14px' }}>{b.desc}</p>
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