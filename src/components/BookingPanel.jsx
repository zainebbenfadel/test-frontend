// src/components/BookingPanel.jsx
import React, { useEffect } from 'react';

function BookingPanel({ open, listing, onClose, onConfirm }) {
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

  return (
    <>
      <div className={`booking-overlay ${open ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`booking-panel ${open ? 'open' : ''}`}>
        <div className="booking-panel-header">
          <div className="booking-panel-title">Reserve Your Stay</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {listing && (
          <>
            <img src={listing.img} alt="" className="booking-img" />
            <div className="booking-name">{listing.name}</div>
            <div className="booking-loc">📍 {listing.location}</div>
            <div className="booking-dates">
              <div className="booking-field"><label>Check In</label><input type="date" id="bCheckin" /></div>
              <div className="booking-field"><label>Check Out</label><input type="date" id="bCheckout" /></div>
            </div>
            <div className="booking-field" style={{ marginBottom: '4px' }}>
              <label>Guests</label>
              <input type="number" defaultValue="2" min="1" max="16" id="bGuests" />
            </div>
            <div className="booking-price-breakdown">
              <div className="price-row"><span>${listing.price} × 3 nights</span><span>${listing.price * 3}</span></div>
              <div className="price-row"><span>Cleaning fee</span><span>$65</span></div>
              <div className="price-row"><span>Service fee</span><span>${Math.round(listing.price * 3 * 0.12)}</span></div>
              <div className="price-row total">
                <span>Total</span>
                <span>${listing.price * 3 + 65 + Math.round(listing.price * 3 * 0.12)}</span>
              </div>
            </div>
            <button className="btn-book-now" onClick={onConfirm}>Reserve Now</button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-3)', marginTop: '12px' }}>You won't be charged yet</p>
          </>
        )}
      </div>
    </>
  );
}

export default BookingPanel;
