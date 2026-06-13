// src/pages/AdminLogin.jsx
import React, { useState, useEffect } from 'react';

const API = 'https://test-backend-hd6i.onrender.com/api/admin';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      sessionStorage.setItem('admin', JSON.stringify(data.admin));
      onLogin(data.admin);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0d1b2e',
      padding: isMobile ? '20px' : '40px'
    }}>
      <div style={{ 
        background: '#13213a', 
        border: '1px solid rgba(201,168,76,0.2)', 
        borderRadius: '20px', 
        padding: isMobile ? '24px' : '40px', 
        width: '100%', 
        maxWidth: isMobile ? '90%' : '400px' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
          <div style={{ 
            color: '#c9a84c', 
            fontSize: isMobile ? '10px' : '11px', 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase', 
            marginBottom: '8px' 
          }}>Admin Panel</div>
          <div style={{ color: '#fff', fontSize: isMobile ? '22px' : '24px', fontWeight: 700 }}>Sign In</div>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(220,50,50,0.1)', 
            border: '1px solid rgba(220,50,50,0.3)', 
            color: '#ff6b6b', 
            borderRadius: '10px', 
            padding: '10px 16px', 
            fontSize: isMobile ? '12px' : '13px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.45)', 
              fontSize: isMobile ? '10px' : '11px', 
              marginBottom: '6px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em' 
            }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '10px', 
                padding: isMobile ? '12px 14px' : '10px 14px', 
                color: '#fff', 
                fontSize: isMobile ? '16px' : '14px', 
                outline: 'none', 
                boxSizing: 'border-box' 
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.45)', 
              fontSize: isMobile ? '10px' : '11px', 
              marginBottom: '6px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em' 
            }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '10px', 
                padding: isMobile ? '12px 14px' : '10px 14px', 
                color: '#fff', 
                fontSize: isMobile ? '16px' : '14px', 
                outline: 'none', 
                boxSizing: 'border-box' 
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              background: 'rgba(201,168,76,0.2)', 
              border: '1px solid rgba(201,168,76,0.4)', 
              color: '#c9a84c', 
              borderRadius: '10px', 
              padding: isMobile ? '14px' : '12px', 
              fontSize: isMobile ? '15px' : '14px', 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              letterSpacing: '0.05em' 
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;