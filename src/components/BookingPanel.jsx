// src/components/BookingPanel.jsx
import React, { useEffect, useState } from 'react';

function BookingPanel({ open, listing, onClose, onConfirm }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (open && listing) {
      const today = new Date().toISOString().split('T')[0];
      const bCheckin = document.getElementById('bCheckin');
      const bCheckout = document.getElementById('bCheckout');
      if (bCheckin) {
        const checkin = new Date();
        checkin.setDate(checkin.getDate() + 3);
        bCheckin.value = checkin.toISOString().split('T')[0];
        bCheckin.min = today;
      }
      if (bCheckout) {
        const checkout = new Date();
        checkout.setDate(checkout.getDate() + 6);
        bCheckout.value = checkout.toISOString().split('T')[0];
        bCheckout.min = today;
      }
    }
  }, [open, listing]);

  if (!open) return null;

  return (
    <>
      <div className={`booking-overlay ${open ? 'open' : ''}`} onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000
      }}></div>
      <div className={`booking-panel ${open ? 'open' : ''}`} style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderRadius: isMobile ? '20px 20px 0 0' : '24px 24px 0 0',
        padding: isMobile ? '20px' : '24px',
        zIndex: 1001,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        maxHeight: isMobile ? '85vh' : '90vh',
        overflowY: 'auto'
      }}>
        <div className="booking-panel-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '16px' : '20px'
        }}>
          <div className="booking-panel-title" style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 600,
            fontFamily: "'Playfair Display', serif",
            color: '#0B1426'
          }}>Reserve Your Stay</div>
          <button className="modal-close" onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: isMobile ? '28px' : '32px',
            cursor: 'pointer',
            color: '#999'
          }}>×</button>
        </div>
        {listing && (
          <>
            <img src={listing.img} alt="" className="booking-img" style={{
              width: '100%',
              height: isMobile ? '180px' : '200px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '16px'
            }} />
            <div className="booking-name" style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>{listing.name}</div>
            <div className="booking-loc" style={{
              fontSize: isMobile ? '13px' : '14px',
              color: '#666',
              marginBottom: '20px'
            }}>📍 {listing.location}</div>
            <div className="booking-dates" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '12px' : '16px',
              marginBottom: '16px'
            }}>
              <div className="booking-field">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>Check In</label>
                <input type="date" id="bCheckin" style={{
                  width: '100%',
                  padding: isMobile ? '12px' : '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px'
                }} />
              </div>
              <div className="booking-field">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>Check Out</label>
                <input type="date" id="bCheckout" style={{
                  width: '100%',
                  padding: isMobile ? '12px' : '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px'
                }} />
              </div>
            </div>
            <div className="booking-field" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>Guests</label>
              <input type="number" defaultValue="2" min="1" max="16" id="bGuests" style={{
                width: '100%',
                padding: isMobile ? '12px' : '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px'
              }} />
            </div>
            <div className="booking-price-breakdown" style={{
              background: '#f5f5f5',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px'
            }}>
              <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: isMobile ? '13px' : '14px' }}>
                <span>${listing.price} × 3 nights</span><span>${listing.price * 3}</span>
              </div>
              <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: isMobile ? '13px' : '14px' }}>
                <span>Cleaning fee</span><span>$65</span>
              </div>
              <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: isMobile ? '13px' : '14px' }}>
                <span>Service fee</span><span>${Math.round(listing.price * 3 * 0.12)}</span>
              </div>
              <div className="price-row total" style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: isMobile ? '15px' : '16px',
                borderTop: '1px solid #ddd',
                paddingTop: '10px',
                marginTop: '5px'
              }}>
                <span>Total</span>
                <span>${listing.price * 3 + 65 + Math.round(listing.price * 3 * 0.12)}</span>
              </div>
            </div>
            <button className="btn-book-now" onClick={onConfirm} style={{
              width: '100%',
              padding: isMobile ? '14px' : '16px',
              background: '#C9A84C',
              color: '#0B1426',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: isMobile ? '16px' : '18px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}>Reserve Now</button>
            <p style={{ textAlign: 'center', fontSize: isMobile ? '11px' : '12px', color: '#999', marginTop: '12px' }}>You won't be charged yet</p>
          </>
        )}
      </div>
    </>
  );
}

export default BookingPanel;