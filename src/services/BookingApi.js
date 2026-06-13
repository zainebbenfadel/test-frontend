const API_BASE = import.meta.env.VITE_API_URL;

// ─── Create a new booking (status starts as 'pending') ────────────────────────
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      guest_id: bookingData.guest_id,
      property_id: bookingData.property_id,  
      arrival: bookingData.arrival,
      departure: bookingData.departure,
      travelers: bookingData.travelers,
      total_price: bookingData.total_price,
      status: bookingData.status,
      reminder_date: bookingData.reminder_date,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la création de la réservation');
  }
  
  return response.json();
};
// ─── Update a booking's status ────────────────────────────────────────────────
// status: 'pending' | 'confirmed' | 'cancelled'
export const updateBookingStatus = async (bookingId, status) => {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors de la mise à jour du statut');
  }
  return res.json();
};

// ─── Get all bookings for a host's properties ─────────────────────────────────
export const fetchBookingsByHost = async (hostId) => {
  const res = await fetch(`${API_BASE}/bookings/host/${hostId}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des réservations');
  return res.json();
};