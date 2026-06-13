// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const STATUS = { IDLE: 'idle', PROCESSING: 'processing', CONFIRMED: 'confirmed' };

const STATUS_META = {
  [STATUS.PROCESSING]: { color: '#C9A84C', bg: 'rgba(201,168,76,0.10)', icon: '⏳', label: 'Envoi en cours…', desc: 'Nous soumettons votre demande.' },
  [STATUS.CONFIRMED]: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: '✅', label: 'Réservation confirmée !', desc: 'Votre réservation est enregistrée. Bon voyage !' },
};

const today = () => new Date().toISOString().split('T')[0];
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };
const nights = (a, b) => (!a || !b) ? 0 : Math.max(0, Math.floor((new Date(b) - new Date(a)) / 86400000));
const fmt = n => Number(n).toLocaleString('fr-DZ');
const remind = d => { const dt = new Date(d); dt.setDate(dt.getDate() - 3); return dt.toISOString().split('T')[0]; };

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test-backend-hd6i.onrender.com';

export default function BookingModal({ 
  listing, 
  onClose, 
  onSuccess,
  initialCheckIn,
  initialCheckOut,
  initialGuests
}) {
  const { user, isGuest, getGuestId } = useAuth();
  
  const [checkIn, setCheckIn] = useState(initialCheckIn || today());
  const [checkOut, setCheckOut] = useState(initialCheckOut || addDays(today(), 3));
  const [guests, setGuests] = useState(initialGuests || 2);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [bookingRef, setRef] = useState(null);
  const [error, setError] = useState(null);

  const n = nights(checkIn, checkOut);
  
  // ✅ FIX: Get price from different possible locations
  const price = listing?.price || listing?.price_per_night || listing?.offers?.[0]?.price_per_night || 0;
  
  const cleaning = 5000;
  const serviceFee = Math.round(price * 0.14);
  const total = price * n + cleaning + serviceFee;
  const maxGuests = listing?.voyageurs || 10;

  useEffect(() => {
    if (initialCheckIn) setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
    if (initialGuests) setGuests(initialGuests);
  }, [initialCheckIn, initialCheckOut, initialGuests]);

  useEffect(() => {
    const h = e => e.key === 'Escape' && status !== STATUS.PROCESSING && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [status, onClose]);

  const handleSubmit = async () => {
    if (n < 1) return;
    
    const guestId = getGuestId();
    
    // ✅ FIX: Try multiple possible ID locations
    const offerId = listing?.offer_id || 
                    listing?.offers?.[0]?.offer_id || 
                    listing?.id || 
                    listing?.property_id;
    
    console.log('🔍 Booking submission debug:');
    console.log('Full listing object:', listing);
    console.log('Guest ID:', guestId);
    console.log('Offer ID found:', offerId);
    console.log('Price:', price);
    console.log('Total:', total);
    
    if (!guestId) {
      setError('❌ Vous devez être connecté en tant qu\'invité pour réserver');
      return;
    }
    
    if (!offerId) {
      setError('❌ ID du logement manquant. Veuillez rafraîchir la page.');
      console.error('No offer_id found in listing:', listing);
      return;
    }

    setError(null);
    setStatus(STATUS.PROCESSING);

    try {
      const bookingData = {
        guest_id: guestId,
        offer_id: offerId,  // ✅ Use offer_id
        arrival: checkIn,
        departure: checkOut,
        travelers: `${guests} voyageur${guests > 1 ? 's' : ''}`,
        total_price: total,
        reminder_date: remind(checkIn),
        status: 'pending',
      };

      console.log('📤 Sending booking data:', bookingData);

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      console.log('📥 Response:', { status: response.status, data });

      if (response.status === 409) {
        const from = new Date(data.conflict.arrival).toLocaleDateString('fr-DZ');
        const to = new Date(data.conflict.departure).toLocaleDateString('fr-DZ');
        setError(`Cette propriété est déjà confirmée du ${from} au ${to}. Veuillez choisir d'autres dates.`);
        setStatus(STATUS.IDLE);
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la réservation.');
        setStatus(STATUS.IDLE);
        return;
      }

      setRef(data.booking_id);
      setStatus(STATUS.CONFIRMED);
      onSuccess?.({ ref: data.booking_id, listing, checkIn, checkOut, guests, total });

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de la réservation.');
      setStatus(STATUS.IDLE);
    }
  };

  if (user && !isGuest()) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,20,38,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h3>Accès réservé aux invités</h3>
          <p>Veuillez vous connecter en tant qu'invité pour effectuer une réservation.</p>
          <button onClick={onClose} style={{ marginTop: 16, padding: '10px 24px', background: '#C9A84C', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const isForm = status === STATUS.IDLE;
  const meta = STATUS_META[status];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,20,38,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && status !== STATUS.PROCESSING && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.28)', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @keyframes bm-in { from { opacity:0; transform:scale(0.94) translateY(14px); } to { opacity:1; transform:none; } }
          @keyframes bm-spin { to { transform: rotate(360deg); } }
        `}</style>

        <div style={{ background: '#0B1426', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
              {bookingRef ? `Réf. ${bookingRef.slice(0,8).toUpperCase()}` : 'Nouvelle réservation'}
            </div>
            <div style={{ color: '#fff', fontSize: 19, fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.2 }}>
              {listing?.title || listing?.name}
            </div>
            <div style={{ color: '#C9A84C', fontSize: 13, marginTop: 4 }}>📍 {listing?.location}</div>
          </div>
          {status !== STATUS.PROCESSING && (
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {isForm && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
                {[
                  { label: 'Arrivée', val: checkIn, set: setCheckIn, min: today() },
                  { label: 'Départ', val: checkOut, set: setCheckOut, min: addDays(checkIn, 1) },
                ].map(({ label, val, set, min }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <input type="date" value={val} min={min} onChange={e => set(e.target.value)}
                      style={{ width: '100%', border: '1.5px solid #e8e8e8', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', color: '#0B1426', background: '#fafaf8', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6, fontWeight: 600 }}>Voyageurs</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #e8e8e8', borderRadius: 10, padding: '8px 14px', background: '#fafaf8' }}>
                  <button onClick={() => setGuests(g => Math.max(1, g-1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: '#0B1426', fontSize: 15 }}>{guests} voyageur{guests > 1 ? 's' : ''}</span>
                  <button onClick={() => setGuests(g => Math.min(maxGuests, g+1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              {n > 0 && (
                <div style={{ background: '#fafaf8', borderRadius: 12, padding: '10px 13px', marginBottom: 0, border: '1px solid #ececec' }}>
                  {[
                    [`${fmt(price)} DA × ${n} nuit${n > 1 ? 's' : ''}`, `${fmt(price * n)} DA`],
                    ['Frais de ménage', `${fmt(cleaning)} DA`],
                    ['Frais de service (14%)', `${fmt(serviceFee)} DA`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 8 }}><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: '#0B1426', marginTop: 4 }}>
                    <span>Total estimé</span><span>{fmt(total)} DA</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
                  ⚠️ {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={n < 1}
                style={{ width: '100%', padding: '15px', fontSize: 15, fontWeight: 700, borderRadius: 50, background: n < 1 ? '#ccc' : '#C9A84C', color: n < 1 ? '#888' : '#0B1426', border: 'none', cursor: n < 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s' }}>
                Confirmer la réservation
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 12, marginBottom: 0 }}>
                Aucun paiement maintenant · Annulation gratuite sous 48h
              </p>
            </>
          )}

          {!isForm && (
            <>
              {status === STATUS.PROCESSING && (
                <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
                  <div style={{ width: 48, height: 48, border: '4px solid #f0f0f0', borderTop: '4px solid #C9A84C', borderRadius: '50%', animation: 'bm-spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                </div>
              )}

              {meta && (
                <div style={{ background: meta.bg, border: `1px solid ${meta.color}33`, borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>{meta.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: meta.color, marginBottom: 5 }}>{meta.label}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{meta.desc}</div>
                </div>
              )}

              {status === STATUS.CONFIRMED && (
                <div style={{ marginTop: 18, padding: '13px 16px', background: '#fafaf8', borderRadius: 12, border: '1px solid #eee', fontSize: 13, color: '#555', lineHeight: 1.8 }}>
                  <div><strong>Arrivée :</strong> {checkIn}</div>
                  <div><strong>Départ :</strong> {checkOut}</div>
                  <div><strong>Voyageurs :</strong> {guests}</div>
                  <div><strong>Total :</strong> {fmt(total)} DA</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {status === STATUS.CONFIRMED && (
                  <button onClick={onClose}
                    style={{ flex: 1, padding: '13px', fontSize: 15, fontWeight: 700, borderRadius: 50, background: '#0B1426', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Fermer
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}