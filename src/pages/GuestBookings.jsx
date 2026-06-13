// src/pages/GuestBookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function GuestBookings() {
  const { user, isGuest, getGuestId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDates, setEditDates] = useState({ arrival: '', departure: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!user || !isGuest()) {
      navigate('/guest');
      return;
    }
    
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    const guestId = getGuestId();
    
    if (!guestId) {
      setError('Guest ID not found');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/guest/${guestId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditDates({
      arrival: booking.arrival,
      departure: booking.departure
    });
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditDates({ arrival: '', departure: '' });
  };

  const handleUpdateDates = async () => {
    const guestId = getGuestId();
    
    setEditLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${editingBooking.booking_id}/dates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrival: editDates.arrival,
          departure: editDates.departure,
          guest_id: guestId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert(data.error);
        } else {
          throw new Error(data.error || 'Failed to update dates');
        }
        return;
      }

      setBookings(bookings.map(booking => 
        booking.booking_id === editingBooking.booking_id 
          ? { ...booking, arrival: editDates.arrival, departure: editDates.departure, status: 'pending' }
          : booking
      ));
      
      alert('✅ Dates updated successfully! Your booking is pending confirmation.');
      setEditingBooking(null);
      
    } catch (err) {
      console.error('Error updating dates:', err);
      alert('❌ Error: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setBookings(bookings.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      
      alert('✅ Booking cancelled successfully');
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('❌ Error cancelling booking');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#FFF3E0', color: '#FF9800', label: 'Pending', icon: '⏳' },
      confirmed: { bg: '#E8F5E9', color: '#4CAF50', label: 'Confirmed', icon: '✅' },
      cancelled: { bg: '#FFEBEE', color: '#F44336', label: 'Cancelled', icon: '❌' },
      completed: { bg: '#E3F2FD', color: '#2196F3', label: 'Completed', icon: '✓' }
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>{style.icon}</span> {style.label}
      </span>
    );
  };

  const getPropertyImage = (booking) => {
    // Try multiple possible locations for images
    if (booking.property?.images && booking.property.images.length > 0) {
      return booking.property.images[0];
    }
    if (booking.property?.img && booking.property.img.length > 0) {
      return Array.isArray(booking.property.img) ? booking.property.img[0] : booking.property.img;
    }
    if (booking.offers?.images && booking.offers.images.length > 0) {
      return booking.offers.images[0];
    }
    if (booking.images && booking.images.length > 0) {
      return booking.images[0];
    }
    // Fallback image
    return 'https://picsum.photos/id/104/200/200';
  };

  const tomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 100, minHeight: '100vh', background: '#f7f4ef', textAlign: 'center' }}>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: 100, minHeight: '100vh', background: '#f7f4ef', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
        <button 
          onClick={() => fetchBookings()} 
          style={{ 
            marginTop: 16, 
            padding: '10px 20px', 
            background: '#C9A84C', 
            border: 'none', 
            borderRadius: 8, 
            cursor: 'pointer' 
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', background: '#f7f4ef' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontFamily: "'Playfair Display', serif", color: '#0B1426', marginBottom: 8 }}>
            My Reservations
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            {bookings.length} {bookings.length === 1 ? 'booking found' : 'bookings found'}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 80,
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
            <h3 style={{ fontSize: 20, color: '#0B1426', marginBottom: 8 }}>No reservations yet</h3>
            <p style={{ color: '#666', marginBottom: 24 }}>You haven't made any reservations yet.</p>
            <Link to="/stays" style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#C9A84C',
              color: '#0B1426',
              textDecoration: 'none',
              borderRadius: 50,
              fontWeight: 600
            }}>
              Discover Stays
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {bookings.map((booking) => {
              // Get the property ID from multiple possible locations
              const propertyId = booking.property_id || booking.offers?.property_id || booking.offer_id;
              
              return (
                <div key={booking.booking_id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <div style={{ width: 200, height: 200, background: '#f0f0f0' }}>
                      <img 
                        src={getPropertyImage(booking)} 
                        alt={booking.property?.title || 'Property'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://picsum.photos/id/104/200/200'; }}
                      />
                    </div>
                    
                    <div style={{ flex: 1, padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", color: '#0B1426', marginBottom: 4 }}>
                            {booking.property?.title || booking.offers?.title || 'Property'}
                          </h3>
                          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                            📍 {booking.property?.location || booking.offers?.location || 'Location not specified'}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      {editingBooking?.booking_id === booking.booking_id ? (
                        <div style={{ 
                          background: '#f5f5f5', 
                          padding: 16, 
                          borderRadius: 12,
                          marginBottom: 16
                        }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>Edit Dates</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>New Check-in</label>
                              <input
                                type="date"
                                value={editDates.arrival}
                                min={tomorrow()}
                                onChange={(e) => setEditDates({ ...editDates, arrival: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #ddd',
                                  borderRadius: 8,
                                  fontSize: 14
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>New Check-out</label>
                              <input
                                type="date"
                                value={editDates.departure}
                                min={editDates.arrival || tomorrow()}
                                onChange={(e) => setEditDates({ ...editDates, departure: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #ddd',
                                  borderRadius: 8,
                                  fontSize: 14
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <button
                              onClick={handleUpdateDates}
                              disabled={editLoading}
                              style={{
                                padding: '8px 20px',
                                background: '#C9A84C',
                                border: 'none',
                                borderRadius: 8,
                                color: '#fff',
                                fontWeight: 600,
                                cursor: editLoading ? 'not-allowed' : 'pointer',
                                opacity: editLoading ? 0.7 : 1
                              }}
                            >
                              {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                padding: '8px 20px',
                                background: 'transparent',
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 16 }}>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Check-in</div>
                              <div style={{ fontWeight: 600 }}>{formatDate(booking.arrival)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Check-out</div>
                              <div style={{ fontWeight: 600 }}>{formatDate(booking.departure)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Guests</div>
                              <div style={{ fontWeight: 600 }}>{booking.travelers}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Total</div>
                              <div style={{ fontWeight: 600, color: '#C9A84C' }}>{Number(booking.total_price).toLocaleString('fr-DZ')} DA</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Link 
                              to={propertyId ? `/property/${propertyId}` : '#'}
                              onClick={(e) => {
                                if (!propertyId) {
                                  e.preventDefault();
                                  alert('Property ID not available');
                                }
                              }}
                              style={{
                                display: 'inline-block',
                                padding: '8px 20px',
                                background: 'transparent',
                                border: '1px solid #C9A84C',
                                color: '#C9A84C',
                                textDecoration: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                opacity: propertyId ? 1 : 0.5,
                                cursor: propertyId ? 'pointer' : 'not-allowed'
                              }}
                              onMouseEnter={(e) => {
                                if (propertyId) {
                                  e.currentTarget.style.background = '#C9A84C';
                                  e.currentTarget.style.color = '#0B1426';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (propertyId) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#C9A84C';
                                }
                              }}
                            >
                              View Property →
                            </Link>
                            
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <>
                                <button
                                  onClick={() => handleEditClick(booking)}
                                  style={{
                                    padding: '8px 20px',
                                    background: 'transparent',
                                    border: '1px solid #2196F3',
                                    color: '#2196F3',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#2196F3';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#2196F3';
                                  }}
                                >
                                  ✏️ Edit Dates
                                </button>
                                
                                <button
                                  onClick={() => handleCancelBooking(booking.booking_id)}
                                  style={{
                                    padding: '8px 20px',
                                    background: 'transparent',
                                    border: '1px solid #F44336',
                                    color: '#F44336',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F44336';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#F44336';
                                  }}
                                >
                                  ❌ Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestBookings;