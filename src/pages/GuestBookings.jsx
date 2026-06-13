// src/pages/GuestBookings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test-backend-hd6i.onrender.com/';

function GuestBookings() {
  const { user, isGuest, getGuestId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDates, setEditDates] = useState({ arrival: '', departure: '' });
  const [editLoading, setEditLoading] = useState(false);
  
  // Responsive state
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
        padding: isMobile ? '4px 10px' : '4px 12px',
        borderRadius: '20px',
        fontSize: isMobile ? '11px' : '12px',
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
    return 'https://picsum.photos/id/104/200/200';
  };

  const tomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div style={{ paddingTop: isMobile ? '80px' : '100px', minHeight: '100vh', background: '#f7f4ef', textAlign: 'center' }}>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: isMobile ? '80px' : '100px', minHeight: '100vh', background: '#f7f4ef', textAlign: 'center' }}>
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
    <div style={{ paddingTop: isMobile ? '80px' : '100px', minHeight: '100vh', background: '#f7f4ef' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        
        <div style={{ marginBottom: isMobile ? '24px' : '40px' }}>
          <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontFamily: "'Playfair Display', serif", color: '#0B1426', marginBottom: '8px' }}>
            My Reservations
          </h1>
          <p style={{ color: '#666', fontSize: isMobile ? '14px' : '16px' }}>
            {bookings.length} {bookings.length === 1 ? 'booking found' : 'bookings found'}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '40px 20px' : '80px',
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: 16 }}>📅</div>
            <h3 style={{ fontSize: isMobile ? '18px' : '20px', color: '#0B1426', marginBottom: 8 }}>No reservations yet</h3>
            <p style={{ color: '#666', marginBottom: 24, fontSize: isMobile ? '13px' : '14px' }}>You haven't made any reservations yet.</p>
            <Link to="/stays" style={{
              display: 'inline-block',
              padding: isMobile ? '10px 24px' : '12px 32px',
              background: '#C9A84C',
              color: '#0B1426',
              textDecoration: 'none',
              borderRadius: 50,
              fontWeight: 600,
              fontSize: isMobile ? '13px' : '14px'
            }}>
              Discover Stays
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
            {bookings.map((booking) => {
              const propertyId = booking.property_id || booking.offers?.property_id || booking.offer_id;
              
              return (
                <div key={booking.booking_id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
                    <div style={{ 
                      width: isMobile ? '100%' : '200px', 
                      height: isMobile ? '200px' : '200px', 
                      background: '#f0f0f0' 
                    }}>
                      <img 
                        src={getPropertyImage(booking)} 
                        alt={booking.property?.title || 'Property'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://picsum.photos/id/104/200/200'; }}
                      />
                    </div>
                    
                    <div style={{ flex: 1, padding: isMobile ? '16px' : '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontFamily: "'Playfair Display', serif", color: '#0B1426', marginBottom: 4 }}>
                            {booking.property?.title || booking.offers?.title || 'Property'}
                          </h3>
                          <p style={{ color: '#666', fontSize: isMobile ? '12px' : '14px', margin: 0 }}>
                            📍 {booking.property?.location || booking.offers?.location || 'Location not specified'}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      {editingBooking?.booking_id === booking.booking_id ? (
                        <div style={{ 
                          background: '#f5f5f5', 
                          padding: isMobile ? '16px' : '16px', 
                          borderRadius: 12,
                          marginBottom: 16
                        }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: isMobile ? '13px' : '14px', fontWeight: 600 }}>Edit Dates</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>New Check-in</label>
                              <input
                                type="date"
                                value={editDates.arrival}
                                min={tomorrow()}
                                onChange={(e) => setEditDates({ ...editDates, arrival: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: isMobile ? '10px 12px' : '8px 12px',
                                  border: '1px solid #ddd',
                                  borderRadius: 8,
                                  fontSize: isMobile ? '16px' : '14px'
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
                                  padding: isMobile ? '10px 12px' : '8px 12px',
                                  border: '1px solid #ddd',
                                  borderRadius: 8,
                                  fontSize: isMobile ? '16px' : '14px'
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button
                              onClick={handleUpdateDates}
                              disabled={editLoading}
                              style={{
                                padding: isMobile ? '10px 20px' : '8px 20px',
                                background: '#C9A84C',
                                border: 'none',
                                borderRadius: 8,
                                color: '#fff',
                                fontWeight: 600,
                                cursor: editLoading ? 'not-allowed' : 'pointer',
                                opacity: editLoading ? 0.7 : 1,
                                fontSize: isMobile ? '13px' : '14px'
                              }}
                            >
                              {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                padding: isMobile ? '10px 20px' : '8px 20px',
                                background: 'transparent',
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: isMobile ? '13px' : '14px'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', 
                            gap: isMobile ? '12px' : '16px', 
                            marginBottom: 16 
                          }}>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Check-in</div>
                              <div style={{ fontWeight: 600, fontSize: isMobile ? '13px' : '14px' }}>{formatDate(booking.arrival)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Check-out</div>
                              <div style={{ fontWeight: 600, fontSize: isMobile ? '13px' : '14px' }}>{formatDate(booking.departure)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Guests</div>
                              <div style={{ fontWeight: 600, fontSize: isMobile ? '13px' : '14px' }}>{booking.travelers}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#999' }}>Total</div>
                              <div style={{ fontWeight: 600, color: '#C9A84C', fontSize: isMobile ? '13px' : '14px' }}>{Number(booking.total_price).toLocaleString('fr-DZ')} DA</div>
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
                                padding: isMobile ? '8px 16px' : '8px 20px',
                                background: 'transparent',
                                border: '1px solid #C9A84C',
                                color: '#C9A84C',
                                textDecoration: 'none',
                                borderRadius: 8,
                                fontSize: isMobile ? '12px' : '13px',
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
                                    padding: isMobile ? '8px 16px' : '8px 20px',
                                    background: 'transparent',
                                    border: '1px solid #2196F3',
                                    color: '#2196F3',
                                    borderRadius: 8,
                                    fontSize: isMobile ? '12px' : '13px',
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
                                    padding: isMobile ? '8px 16px' : '8px 20px',
                                    background: 'transparent',
                                    border: '1px solid #F44336',
                                    color: '#F44336',
                                    borderRadius: 8,
                                    fontSize: isMobile ? '12px' : '13px',
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