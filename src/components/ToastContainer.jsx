// src/components/ToastContainer.jsx
import React, { useState, useEffect } from 'react';

function ToastContainer({ toasts }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: isMobile ? '16px' : '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
      pointerEvents: 'none',
      width: isMobile ? '90%' : 'auto'
    }}>
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{
          background: '#0B1426',
          color: '#fff',
          padding: isMobile ? '12px 20px' : '14px 28px',
          borderRadius: '50px',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid rgba(201,168,76,0.3)',
          textAlign: 'center',
          pointerEvents: 'auto',
          maxWidth: isMobile ? '100%' : '400px',
          wordBreak: 'break-word'
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;