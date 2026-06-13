// src/pages/HostPropertyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HostPropertyDetailPage({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hostUser } = useAuth();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      // Get fresh host data from localStorage
      const host = JSON.parse(localStorage.getItem('host_user'));
      console.log('Host data for property fetch:', host);
      
      if (!host || !host.host_id) {
        console.error('No host found, redirecting to login');
        showToast('⚠️ Please login again');
        navigate('/host/login');
        return;
      }

      // Fetch property details
      const propertyResponse = await fetch(`https://test-backend-hd6i.onrender.com/api/host/properties/${id}?host_id=${host.host_id}`);
      
      if (propertyResponse.ok) {
        const propertyData = await propertyResponse.json();
        setProperty(propertyData);
      } else if (propertyResponse.status === 404) {
        showToast('❌ Property not found');
        navigate('/host/dashboard');
        return;
      } else {
        showToast('❌ Error loading property');
        navigate('/host/dashboard');
        return;
      }

      // Fetch reviews for this property
      const reviewsResponse = await fetch(`https://test-backend-hd6i.onrender.com/api/properties/${id}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
      showToast('❌ Error loading property details');
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Get rental period text based on rental_type
  const getRentalPeriodText = () => {
    if (!property) return 'night';
    switch (property.rental_type) {
      case 'day':
        return 'night';
      case 'month':
        return 'month';
      case 'year':
        return 'year';
      default:
        return 'night';
    }
  };

  // Get rental period emoji
  const getRentalPeriodEmoji = () => {
    if (!property) return '📅';
    switch (property.rental_type) {
      case 'day':
        return '📅';
      case 'month':
        return '📆';
      case 'year':
        return '🗓️';
      default:
        return '📅';
    }
  };

  // Navigate back to dashboard
  const goToDashboard = () => {
    navigate('/host-dashboard');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f5f5f5', 
        paddingTop: '80px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f5f5f5', 
        paddingTop: '80px',
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px' }}>
          <h2 style={{ marginBottom: '16px' }}>Property not found</h2>
          <button 
            onClick={goToDashboard} 
            style={{ 
              padding: '12px 24px', 
              background: '#c9a84c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const images = property.img && Array.isArray(property.img) ? property.img : (property.img ? [property.img] : []);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingTop: '80px' }}>
      {/* Dashboard Sub-header - matches the dashboard style */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        zIndex: 99,
        backgroundColor: 'white'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '24px',
            color: '#2c1810',
            margin: 0
          }}>
            Property Details
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: '13px' }}>
            Review and manage your property
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={goToDashboard}
            style={{
              padding: '10px 20px',
              background: '#4c9aff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 48px 48px 48px' }}>
        {/* Property Title and Status */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '8px' }}>{property.title}</h2>
              <p style={{ color: '#666' }}>📍 {property.location}</p>
              {property.wilaya && <p style={{ color: '#666' }}>🏙️ Wilaya: {property.wilaya}</p>}
            </div>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              background: property.status === 'approved' ? '#e8f5e9' : (property.status === 'rejected' ? '#ffebee' : '#fff3e0'),
              color: property.status === 'approved' ? '#2e7d32' : (property.status === 'rejected' ? '#d32f2f' : '#ed6c02')
            }}>
              {property.status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
            <div>
              <strong>💰 Price:</strong> {property.price} DA
              <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                /{getRentalPeriodText()}
              </span>
              <span style={{ marginLeft: '8px', fontSize: '12px' }}>{getRentalPeriodEmoji()}</span>
            </div>
            <div><strong>👥 Max Guests:</strong> {property.voyageurs || 'Not specified'}</div>
            <div><strong>🛏️ Bedrooms:</strong> {property.chambres || 'Not specified'}</div>
            <div><strong>🚿 Bathrooms:</strong> {property.salle_de_bain || 'Not specified'}</div>
            {property.surface && <div><strong>📐 Surface:</strong> {property.surface} m²</div>}
            {property.rental_type && (
              <div>
                <strong>📋 Rental Type:</strong> {getRentalPeriodEmoji()} {
                  property.rental_type === 'day' ? 'Per Day' : 
                  property.rental_type === 'month' ? 'Per Month' : 
                  'Per Year'
                }
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e0e0e0', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              color: activeTab === 'details' ? '#c9a84c' : '#666',
              borderBottom: activeTab === 'details' ? '2px solid #c9a84c' : 'none',
              marginBottom: '-2px',
              whiteSpace: 'nowrap'
            }}
          >
            Property Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              color: activeTab === 'reviews' ? '#c9a84c' : '#666',
              borderBottom: activeTab === 'reviews' ? '2px solid #c9a84c' : 'none',
              marginBottom: '-2px',
              whiteSpace: 'nowrap'
            }}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              color: activeTab === 'edit' ? '#c9a84c' : '#666',
              borderBottom: activeTab === 'edit' ? '2px solid #c9a84c' : 'none',
              marginBottom: '-2px',
              whiteSpace: 'nowrap'
            }}
          >
            Edit Property
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Images Gallery */}
            {images.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#333' }}>Property Images</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {images.map((img, index) => (
                    <img 
                      key={index} 
                      src={img} 
                      alt={`Property ${index + 1}`} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#333' }}>Description</h3>
                <p style={{ lineHeight: '1.8', color: '#666' }}>{property.description}</p>
              </div>
            )}

            {/* Tags/Amenities */}
            {property.tags && property.tags.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#333' }}>Amenities</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {property.tags.map(tag => (
                    <span key={tag} style={{ padding: '6px 12px', background: '#f0f0f0', borderRadius: '20px', fontSize: '14px', color: '#666' }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {property.google_maps_url && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#333' }}>Location Map</h3>
                <a 
                  href={property.google_maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                    background: '#f9f9f9',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ 
                      height: '200px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📍</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Click to view on Google Maps</div>
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                        View full map with directions
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {property.location || 'Property location'}
                      </div>
                      <div style={{ marginTop: '12px', color: '#c9a84c', fontSize: '14px' }}>
                        Open in Google Maps →
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Video Tour */}
            {property.video && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#333' }}>Video Tour</h3>
                <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  {property.video.includes('youtube.com') || property.video.includes('youtu.be') ? (
                    <iframe
                      src={property.video.replace('watch?v=', 'embed/')}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      title="Property Video"
                    />
                  ) : property.video.includes('vimeo.com') ? (
                    <iframe
                      src={property.video.replace('vimeo.com', 'player.vimeo.com/video')}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      title="Property Video"
                    />
                  ) : (
                    <video 
                      src={property.video} 
                      controls 
                      style={{ width: '100%', maxHeight: '400px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* Category & Badge */}
            {(property.category || property.badge) && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                {property.category && (
                  <div><strong>Category:</strong> {property.category}</div>
                )}
                {property.badge && (
                  <div><strong>Badge:</strong> <span style={{ color: '#c9a84c' }}>{property.badge}</span></div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', color: '#333' }}>Guest Reviews & Comments</h3>
              {reviews.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#c9a84c' }}>{getAverageRating()} ★</div>
                  <div style={{ color: '#666' }}>Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <p>No reviews yet. Guests will leave reviews after their stay.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.map((review, index) => (
                  <div key={review.review_id || index} style={{ borderBottom: index !== reviews.length - 1 ? '1px solid #e0e0e0' : 'none', paddingBottom: index !== reviews.length - 1 ? '24px' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ color: '#333' }}>{review.guest_name || 'Anonymous Guest'}</strong>
                          <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>★ {review.rating || 'N/A'}</span>
                        </div>
                        {review.created_at && (
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{ color: '#666', lineHeight: '1.6', marginTop: '8px' }}>"{review.comment}"</p>
                    )}
                    {!review.comment && review.comment !== undefined && (
                      <p style={{ color: '#999', fontStyle: 'italic', marginTop: '8px' }}>No comment provided</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px', color: '#333' }}>Edit Property</h3>
            <p style={{ color: '#999', marginBottom: '24px' }}>To edit this property, please go back to the dashboard and click the "Edit" button on your property.</p>
            <button
              onClick={goToDashboard}
              style={{
                padding: '12px 24px',
                background: '#c9a84c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Go to Dashboard to Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostPropertyDetailPage;