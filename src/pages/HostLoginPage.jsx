// src/pages/HostLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HostLoginPage({ showToast }) {
  const navigate = useNavigate();
  const { hostLogin, hostSignup } = useAuth();
  
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

  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [numTele, setNumTele] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [emploi, setEmploi] = useState('');
  const [secQst, setSecQst] = useState('');
  const [loading, setLoading] = useState(false);

  const algerianWilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M’Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
  ];

  const employmentOptions = [
    'Student', 'Employed Full-time', 'Employed Part-time', 'Self-employed',
    'Business Owner', 'Freelancer', 'Homemaker', 'Retired', 'Unemployed', 'Other'
  ];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tab === 'signin') {
      if (!email || !password) { 
        showToast('⚠️ Please fill in all fields.'); 
        return; 
      }
      
      setLoading(true);
      try {
        await hostLogin({ email, password });
        showToast('✨ Welcome back! Redirecting to dashboard...');
        navigate('/host-dashboard');
      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      if (!fullName || !email || !password || !username) { 
        showToast('⚠️ Please fill in all required fields (*).'); 
        return; 
      }
      if (age && (age < 18 || age > 120)) {
        showToast('⚠️ Age must be between 18 and 120.');
        return;
      }
      if (numTele && !/^(\+?213|0)?[5-7]\d{8}$/.test(numTele.replace(/\s/g, ''))) {
        showToast('⚠️ Please enter a valid Algerian phone number.');
        return;
      }
      
      setLoading(true);
      try {
        const signupData = {
          full_name: fullName,
          email,
          password,
          username,
          age: age ? parseInt(age) : null,
          num_tele: numTele || null,
          wilaya: wilaya || null,
          emploi: emploi || null,
          sec_qst: secQst || null
        };
        
        await hostSignup(signupData);
        showToast('✨ Account created! Please sign in.');
        setFullName('');
        setEmail('');
        setPassword('');
        setUsername('');
        setAge('');
        setNumTele('');
        setWilaya('');
        setEmploi('');
        setSecQst('');
        setTab('signin');
      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocial = (provider) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(`✨ Signed in with ${provider}! Redirecting to dashboard...`);
      navigate('/host-dashboard');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '100px 16px 60px' : '120px 24px 60px',
      position: 'relative',
      overflow: 'auto'
    }}>
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', left: '-150px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '520px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '40px' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)', marginBottom: '16px', fontSize: isMobile ? '12px' : '14px' }}>
            Host Portal
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 600, color: 'var(--white)', lineHeight: 1.2, marginBottom: '12px'
          }}>
            {tab === 'signin' ? 'Welcome Back,' : 'Join as a'}<br />
            <em style={{ color: 'var(--gold-light)' }}> Host</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? '13px' : '14px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", padding: isMobile ? '0 16px' : '0' }}>
            {tab === 'signin'
              ? 'Sign in to access your host dashboard and listing tools.'
              : 'Create your account and start earning from your space.'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: 'var(--radius-lg)',
          padding: isMobile ? '24px' : '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)'
        }}>
          {/* Tabs */}
          <div className="modal-tabs" style={{ marginBottom: isMobile ? '24px' : '32px', display: 'flex', gap: isMobile ? '8px' : '16px' }}>
            <button className={`modal-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')} style={{ flex: 1, padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '16px' }}>
              Sign In
            </button>
            <button className={`modal-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')} style={{ flex: 1, padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '16px' }}>
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>

            {/* Signup-only fields */}
            {tab === 'signup' && (
              <>
                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>
                    Full Name <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--white)', borderColor: 'rgba(201,168,76,0.2)', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', width: '100%', borderRadius: '10px', border: '1px solid' }}
                  />
                </div>

                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>
                    Username <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="john_doe"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--white)', borderColor: 'rgba(201,168,76,0.2)', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', width: '100%', borderRadius: '10px', border: '1px solid' }}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: isMobile ? '10px' : '11px', marginTop: '4px' }}>
                    Only lowercase letters, numbers, and underscores
                  </p>
                </div>

                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>Age</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    min="18"
                    max="120"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--white)', borderColor: 'rgba(201,168,76,0.2)', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', width: '100%', borderRadius: '10px', border: '1px solid' }}
                  />
                </div>

                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="05XX XX XX XX"
                    value={numTele}
                    onChange={e => setNumTele(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--white)', borderColor: 'rgba(201,168,76,0.2)', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', width: '100%', borderRadius: '10px', border: '1px solid' }}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: isMobile ? '10px' : '11px', marginTop: '4px' }}>
                    Format: 05XXXXXXXX or +213XXXXXXXXX
                  </p>
                </div>

                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>Wilaya (Province)</label>
                  <select
                    value={wilaya}
                    onChange={e => setWilaya(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '10px',
                      padding: isMobile ? '12px' : '14px',
                      color: 'var(--white)',
                      fontSize: isMobile ? '14px' : '15px',
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" style={{ background: 'var(--navy)' }}>Select your wilaya</option>
                    {algerianWilayas.map(w => (
                      <option key={w} value={w} style={{ background: 'var(--navy)' }}>{w}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>Employment Status</label>
                  <select
                    value={emploi}
                    onChange={e => setEmploi(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '10px',
                      padding: isMobile ? '12px' : '14px',
                      color: 'var(--white)',
                      fontSize: isMobile ? '14px' : '15px',
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" style={{ background: 'var(--navy)' }}>Select employment status</option>
                    {employmentOptions.map(opt => (
                      <option key={opt} value={opt} style={{ background: 'var(--navy)' }}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>Security Question</label>
                  <textarea
                    placeholder="e.g., What was your first pet's name?"
                    value={secQst}
                    onChange={e => setSecQst(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '10px',
                      padding: isMobile ? '12px' : '14px',
                      color: 'var(--white)',
                      fontSize: isMobile ? '14px' : '15px',
                      fontFamily: "'DM Sans', sans-serif",
                      resize: 'vertical'
                    }}
                  />
                </div>
              </>
            )}

            {/* Email - required for both */}
            <div className="form-field">
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>
                Email Address <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--white)', borderColor: 'rgba(201,168,76,0.2)', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', width: '100%', borderRadius: '10px', border: '1px solid' }}
              />
            </div>

            {/* Password - required for both */}
            <div className="form-field">
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '12px' : '13px' }}>
                Password <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--white)', borderColor: 'rgba(201,168,76,0.2)', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', width: '100%', borderRadius: '10px', border: '1px solid' }}
              />
              {tab === 'signup' && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: isMobile ? '10px' : '11px', marginTop: '4px' }}>
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {tab === 'signin' && (
              <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                <button type="button" style={{
                  background: 'none', border: 'none', color: 'var(--gold)',
                  fontSize: isMobile ? '12px' : '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0
                }} onClick={() => showToast('📧 Password reset email sent!')}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn-gold" style={{
              width: '100%', padding: isMobile ? '14px' : '16px', fontSize: isMobile ? '14px' : '15px',
              borderRadius: '12px', marginTop: '4px',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer'
            }} disabled={loading}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In & Continue' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider" style={{ margin: isMobile ? '20px 0' : '28px 0', textAlign: 'center', position: 'relative' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', padding: '0 12px', fontSize: isMobile ? '12px' : '13px' }}>or continue with</span>
          </div>

          {/* Social */}
          <div className="social-login" style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
            {['🌐 Google', '🍎 Apple', '📘 Facebook'].map(p => (
              <button key={p} className="social-login-btn" style={{
                background: 'rgba(255,255,255,0.06)', color: 'var(--white)',
                border: '1px solid rgba(255,255,255,0.12)', flex: 1,
                padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '13px' : '14px',
                borderRadius: '10px', cursor: 'pointer'
              }} onClick={() => handleSocial(p.split(' ')[1])} disabled={loading}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: isMobile ? '12px' : '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s'
          }}
            onClick={() => navigate('/host')}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← Back to Host page
          </button>
        </div>
      </div>
    </div>
  );
}

export default HostLoginPage;