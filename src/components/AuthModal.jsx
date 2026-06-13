// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALGERIAN_WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem',"M'Sila",'Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued',
  'Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane',
];

const CIVIL_STATES = ['Célibataire', 'Marié', 'Mariée'];

function AuthModal({ open, onClose, onAuth }) {
  const { guestLogin, guestSignup } = useAuth();
  const navigate = useNavigate();

  const [authTab,     setAuthTab]     = useState('signin');
  const [error,       setError]       = useState(null);
  const [loading,     setLoading]     = useState(false);

  // sign-in fields
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');

  // sign-up fields
  const [fullName,    setFullName]    = useState('');
  const [username,    setUsername]    = useState('');
  const [numTele,     setNumTele]     = useState('');
  const [wilaya,      setWilaya]      = useState('');
  const [age,         setAge]         = useState('');
  const [civilState,  setCivilState]  = useState('');   // ← NEW

  const closeOnBg = (e) => { if (e.target === e.currentTarget) onClose(); };

  const reset = () => {
    setError(null);
    setEmail(''); setPassword('');
    setFullName(''); setUsername('');
    setNumTele(''); setWilaya(''); setAge('');
    setCivilState('');   // ← NEW
  };

  const handleSignIn = async () => {
    if (!email || !password) return setError('Email and password are required');
    setLoading(true); setError(null);
    try {
      const data = await guestLogin({ email, password });
      onAuth(data.guest);
      onClose(); reset();
      navigate('/guest');
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !username)
      return setError('Full name, email, password and username are required');
    if (age && (Number(age) < 18 || Number(age) > 120))
      return setError('Age must be between 18 and 120');
    if (numTele && !/^(05|06|07)\d{8}$/.test(numTele))
      return setError('Phone must be 10 digits starting with 05, 06, or 07');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError('Invalid email address');

    setLoading(true); setError(null);
    try {
      const data = await guestSignup({
        full_name: fullName,
        email,
        password,
        username,
        num_tele:    numTele,
        wilaya,
        age,
        civil_state: civilState || null,   // ← NEW
      });
      onAuth(data.guest);
      onClose(); reset();
      navigate('/guest');
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={closeOnBg}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Welcome to <em>Mabiti'i</em></div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-tabs">
            <button
              className={`modal-tab ${authTab === 'signin' ? 'active' : ''}`}
              onClick={() => { setAuthTab('signin'); setError(null); }}
            >Sign In</button>
            <button
              className={`modal-tab ${authTab === 'signup' ? 'active' : ''}`}
              onClick={() => { setAuthTab('signup'); setError(null); }}
            >Create Account</button>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#ff6b6b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div className="modal-form">
            {authTab === 'signin' ? (
              <>
                <div className="form-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
                </div>
                <button className="btn-primary" style={{ padding: '14px', borderRadius: '10px', fontSize: '15px' }}
                  onClick={handleSignIn} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </>
            ) : (
              <>
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Username *</label>
                  <input type="text" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Email Address *</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Password *</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input type="text" placeholder="06XXXXXXXX" value={numTele} onChange={e => setNumTele(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Wilaya</label>
                  <select value={wilaya} onChange={e => setWilaya(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
                    <option value="">Select wilaya</option>
                    {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Age</label>
                  <input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} min="18" max="120" />
                </div>

                {/* ── Civil State ── */}
                <div className="form-field">
                  <label>Civil State</label>
                  <select value={civilState} onChange={e => setCivilState(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
                    <option value="">Select civil state</option>
                    {CIVIL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <button className="btn-primary" style={{ padding: '14px', borderRadius: '10px', fontSize: '15px' }}
                  onClick={handleSignUp} disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </>
            )}

            <div className="form-divider"><span>or continue with</span></div>
            <div className="social-login">
              <button className="social-login-btn">🌐 Google</button>
              <button className="social-login-btn">📘 Facebook</button>
              <button className="social-login-btn">📨 Telegram</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;