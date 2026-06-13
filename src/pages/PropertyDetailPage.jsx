// src/pages/PropertyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPropertyById, fetchProperties } from '../services/propertiesApi';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist, getWishlistIds } from '../services/wishlistApi';
import { getReviews, addReview, updateReview, deleteReview } from '../services/reviewsApi';
import BookingModal from '../components/BookingModal';
import { getOrCreateConversation } from '../services/messagedAPI.js';
import { ChatModal } from '../components/chatModal.jsx';

// Modal for "Show all photos"
function PhotoModal({ images, onClose, startIndex = 0 }) {
  const [current, setCurrent] = useState(startIndex);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(c + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: isMobile ? '13px' : '15px', fontWeight: 600 }}>{current + 1} / {images.length}</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: isMobile ? '36px' : '40px', height: isMobile ? '36px' : '40px', cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      <div style={{ position: 'relative', maxWidth: '900px', width: isMobile ? '95%' : '90%' }}>
        <img
          src={images[current]}
          alt={`Photo ${current + 1}`}
          style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
          onError={e => { e.target.src = 'https://picsum.photos/id/104/1200/700'; }}
        />
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)} style={{ position: 'absolute', left: isMobile ? '-30px' : '-56px', top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>‹</button>
        )}
        {current < images.length - 1 && (
          <button onClick={() => setCurrent(c => c + 1)} style={{ position: 'absolute', right: isMobile ? '-30px' : '-56px', top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', cursor: 'pointer', fontSize: isMobile ? '16px' : '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>›</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', maxWidth: '90%', padding: '4px' }}>
        {images.map((img, i) => (
          <img
            key={i} src={img} alt={`Thumbnail ${i + 1}`} onClick={() => setCurrent(i)}
            style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '40px' : '52px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: i === current ? '2px solid #C9A84C' : '2px solid transparent', opacity: i === current ? 1 : 0.6, flexShrink: 0, transition: 'all 0.2s' }}
          />
        ))}
      </div>
    </div>
  );
}

// Airbnb-style gallery: 1 big + 4 small grid
function ImageGallery({ images, listingName, isSaved, onToggleSave, saveLoading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState(0);
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

  const main = images?.[0] || 'https://picsum.photos/id/104/1200/700';
  const grid = [...(images?.slice(1, 5) || [])];
  while (grid.length < 4) grid.push(null);

  const openModal = (index) => { setModalStart(index); setModalOpen(true); };

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 16px 12px' : '24px 40px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: isMobile ? '12px' : '0' }}>
        <div>
          <div style={{ fontSize: isMobile ? '11px' : '13px', color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'block', width: '24px', height: '1px', background: '#C9A84C' }}></span>
            {listingName}
          </div>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? '12px' : '8px', alignItems: 'center' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? '12px' : '14px', fontWeight: 600, color: '#0B1426', padding: isMobile ? '6px 10px' : '8px 12px', borderRadius: '8px', textDecoration: 'underline' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share
          </button>

          <button
            onClick={onToggleSave}
            disabled={saveLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isSaved ? 'rgba(230,57,70,0.08)' : 'transparent',
              border: 'none', cursor: saveLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit', fontSize: isMobile ? '12px' : '14px', fontWeight: 600,
              color: isSaved ? '#e63946' : '#0B1426',
              padding: isMobile ? '6px 10px' : '8px 12px', borderRadius: '8px', textDecoration: 'underline'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? '#e63946' : 'none'} stroke={isSaved ? '#e63946' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {saveLoading ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px', position: 'relative' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gridTemplateRows: isMobile ? 'auto' : '260px 260px', 
          gap: '8px', 
          borderRadius: '16px', 
          overflow: 'hidden' 
        }}>
          <div style={{ gridRow: isMobile ? '1' : '1 / 3', position: 'relative', cursor: 'pointer', overflow: 'hidden' }} onClick={() => openModal(0)}>
            <img src={main} alt={listingName}
              style={{ width: '100%', height: isMobile ? '250px' : '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.src = 'https://picsum.photos/id/104/1200/700'; }}
            />
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', 
            gridTemplateRows: isMobile ? '150px 150px' : '260px 260px', 
            gap: '8px', 
            gridRow: isMobile ? 'auto' : '1 / 3' 
          }}>
            {grid.map((img, i) => (
              <div key={i}
                style={{ position: 'relative', overflow: 'hidden', cursor: img ? 'pointer' : 'default', background: '#f5f5f5' }}
                onClick={() => img && openModal(i + 1)}>
                {img ? (
                  <img src={img} alt={`Photo ${i + 2}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = 'https://picsum.photos/id/104/600/400'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />
                )}
                {i === 3 && images?.length > 1 && !isMobile && (
                  <button
                    onClick={e => { e.stopPropagation(); openModal(0); }}
                    style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#000', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    Show all photos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {!isMobile && images?.length > 1 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 40px', textAlign: 'right' }}>
          <button onClick={() => openModal(0)} style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Show all {images.length} photos
          </button>
        </div>
      )}

      {modalOpen && <PhotoModal images={images?.filter(Boolean) || []} onClose={() => setModalOpen(false)} startIndex={modalStart} />}
    </>
  );
}

function LocationMap({ location, listingName }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!location) return null;
  const encoded = encodeURIComponent(location);
  const embedUrl = `https://www.google.com/maps?q=${encoded}&z=14&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  return (
    <div style={{ marginBottom: '48px' }}>
      <div className="section-eyebrow" style={{ marginBottom: '8px', color: '#C9A84C', fontSize: isMobile ? '12px' : '14px' }}>Where you'll be</div>
      <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#0B1426', margin: '0 0 4px' }}>
        {location}
      </h3>
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: '0 4px 24px rgba(11,20,38,0.08)' }}>
        <iframe
          title={`Map - ${listingName}`}
          src={embedUrl}
          width="100%"
          height={isMobile ? "300" : "400"}
          style={{ border: 'none', display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a href={mapsLink} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: isMobile ? '13px' : '14px', fontWeight: 600, color: '#0B1426', textDecoration: 'underline' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Open in Google Maps
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
  );
}

// Star Rating Input Component
function StarRatingInput({ rating, onRatingChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontSize: isMobile ? size * 0.8 : size,
            color: (hover || rating) >= star ? '#FFD700' : '#ddd',
            transition: 'transform 0.1s',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// Star Rating Display Component
function StarRatingDisplay({ rating, size = 16, showNumber = true }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ fontSize: size, color: star <= fullStars ? '#FFD700' : (star === fullStars + 1 && hasHalfStar ? '#FFD700' : '#ddd') }}>
            {star <= fullStars ? '★' : (star === fullStars + 1 && hasHalfStar ? '½' : '☆')}
          </span>
        ))}
      </div>
      {showNumber && rating > 0 && (
        <span style={{ fontSize: size - 2, color: '#666', fontWeight: 500 }}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function PropertyDetailPage({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest, getGuestId } = useAuth();

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

  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: (() => {
      const dt = new Date();
      dt.setDate(dt.getDate() + 3);
      return dt.toISOString().split('T')[0];
    })(),
    guests: 2
  });

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  const [wishlist, setWishlist] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setListing(null);
    setRelated([]);

    fetchPropertyById(id)
      .then(data => {
        setListing(data);
        return fetchProperties().then(all => {
          const filtered = all.filter(l => l.property_id !== data.property_id && l.category === data.category).slice(0, 3);
          setRelated(filtered);
        });
      })
      .catch((err) => {
        console.error('Error fetching property:', err);
        showToast('❌ Property not found');
        setListing(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (listing && listing.property_id) {
      loadReviews();
    }
  }, [listing]);

  const loadReviews = async () => {
    if (!listing?.property_id) return;
    
    try {
      const reviewsData = await getReviews(listing.property_id);
      setReviews(reviewsData);
      
      if (reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
        const avg = sum / reviewsData.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
      
      if (user && isGuest()) {
        const existingReview = reviewsData.find(r => r.user_id === user.user_id);
        if (existingReview) {
          setUserReview(existingReview);
          setReviewRating(existingReview.rating);
          setReviewComment(existingReview.comment);
        } else {
          setUserReview(null);
          setReviewRating(0);
          setReviewComment('');
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('❌ Failed to load reviews');
    }
  };

  useEffect(() => {
    if (!listing || !user || !isGuest()) {
      setWishlist(false);
      return;
    }
    getWishlistIds(user.user_id)
      .then(ids => setWishlist(ids.includes(listing.property_id)))
      .catch(() => {});
  }, [listing, user]);

  const handleSubmitReview = async () => {
    if (!user || !isGuest()) {
      showToast('🔒 Please login as a guest to leave a review');
      return;
    }
    
    if (reviewRating === 0) {
      showToast('⭐ Please choose a rating');
      return;
    }

    const propertyId = listing?.property_id;
    if (!propertyId) {
      showToast('❌ Error: Property ID missing');
      return;
    }

    setReviewSubmitting(true);
    
    try {
      const reviewData = {
        property_id: propertyId,
        guest_id: user.user_id,
        rating: reviewRating,
        comment: reviewComment.trim()
      };

      if (userReview && !editingReview) {
        await updateReview(userReview.review_id, reviewData);
        showToast('✅ Review updated');
      } else {
        await addReview(reviewData);
        showToast('⭐ Review published!');
      }
      
      setEditingReview(false);
      setReviewRating(0);
      setReviewComment('');
      await loadReviews();
      
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = () => {
    setEditingReview(true);
  };

  const handleCancelEdit = () => {
    setEditingReview(false);
    if (userReview) {
      setReviewRating(userReview.rating);
      setReviewComment(userReview.comment);
    } else {
      setReviewRating(0);
      setReviewComment('');
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete your review? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await deleteReview(userReview.review_id);
      showToast('✅ Your review has been deleted');
      
      setUserReview(null);
      setReviewRating(0);
      setReviewComment('');
      setEditingReview(false);
      
      await loadReviews();
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    }
  };

  const handleToggleSave = async () => {
    if (!user || !isGuest()) {
      showToast('🔒 Sign in as a guest to save properties');
      return;
    }

    const wasSaved = wishlist;
    setWishlist(!wasSaved);
    setSaveLoading(true);

    try {
      if (wasSaved) {
        await removeFromWishlist(user.user_id, listing.property_id);
        showToast('💔 Removed from wishlist');
      } else {
        await addToWishlist(user.user_id, listing.property_id);
        showToast('❤️ Added to wishlist');
      }
    } catch (err) {
      setWishlist(wasSaved);
      showToast(`❌ ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const openChatWithHost = async () => {
    if (!user || !listing?.host_id) return;

    try {
      setChatLoading(true);
      const conv = await getOrCreateConversation(
        user.user_id,
        listing.host_id,
        listing.property_id
      );
      setActiveConversation(conv);
      setChatOpen(true);
    } catch (err) {
      console.error(err);
      showToast('❌ Chat error');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <p style={{ textAlign: 'center', padding: isMobile ? 40 : 80, background: '#faf8f3', minHeight: '100vh' }}>
      Loading...
    </p>
  );

  if (!listing) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#faf8f3', padding: isMobile ? '20px' : '0' }}>
      <h2 style={{ color: '#0B1426', fontSize: isMobile ? '22px' : '28px' }}>Property not found</h2>
      <button className="btn-gold" onClick={() => navigate('/stays')} style={{ padding: isMobile ? '10px 24px' : '12px 28px', fontSize: isMobile ? '14px' : '16px' }}>Back to stays</button>
    </div>
  );

  const images = listing.img?.length ? listing.img : [];
  const propertyPrice = listing.price || 0;

  return (
    <div style={{ background: '#faf8f3', minHeight: '100vh' }}>

      {/* Back button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '80px 16px 0' : '110px 40px 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', color: '#0B1426', borderRadius: '50px', padding: isMobile ? '8px 16px' : '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? '13px' : '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
        >
          ← Back
        </button>
      </div>

      {bookingOpen && (
        <BookingModal
          listing={listing}
          initialCheckIn={bookingFormData.checkIn}
          initialCheckOut={bookingFormData.checkOut}
          initialGuests={bookingFormData.guests}
          onClose={() => setBookingOpen(false)}
          onSuccess={({ ref }) => {
            setBookingOpen(false);
            showToast && showToast(`🎉 Booking confirmed! Ref. ${ref.slice(0,8).toUpperCase()}`);
          }}
        />
      )}

      <ImageGallery
        images={images}
        listingName={listing.title}
        isSaved={wishlist}
        onToggleSave={handleToggleSave}
        saveLoading={saveLoading}
      />

      {chatOpen && activeConversation && (
        <ChatModal
          conversation={activeConversation}
          currentUser={user}
          onClose={() => setChatOpen(false)}
          showToast={showToast}
        />
      )}

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '24px 16px 40px' : '48px 40px 60px', 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', 
        gap: isMobile ? '30px' : '60px', 
        alignItems: 'start' 
      }}>

        {/* LEFT COLUMN */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
            <h1 style={{ color: '#0B1426', fontSize: isMobile ? 'clamp(24px, 6vw, 32px)' : 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {listing.title}
            </h1>
            {listing.badge && (
              <div style={{ background: listing.badge === 'New' ? '#C9A84C' : '#0B1426', color: listing.badge === 'New' ? '#0B1426' : '#C9A84C', padding: isMobile ? '6px 14px' : '8px 18px', borderRadius: '50px', fontWeight: 700, fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap' }}>
                {listing.badge}
              </div>
            )}
          </div>

          <div style={{ color: '#666', fontSize: isMobile ? '13px' : '15px', marginBottom: '6px' }}>📍 {listing.location}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '24px' : '32px', flexWrap: 'wrap' }}>
            <StarRatingDisplay rating={averageRating} size={isMobile ? 16 : 18} showNumber={true} />
            <span style={{ color: '#666', fontSize: isMobile ? '12px' : '14px' }}>
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '16px' : '32px', 
            padding: isMobile ? '16px 0' : '24px 0', 
            borderTop: '1px solid #e0e0e0', 
            borderBottom: '1px solid #e0e0e0', 
            marginBottom: isMobile ? '24px' : '40px', 
            flexWrap: 'wrap' 
          }}>
            {[
              { label: 'Guests', value: listing.voyageurs || '—' },
              { label: 'Bedrooms', value: listing.chambres || '—' },
              { label: 'Bathrooms', value: listing.salle_de_bain || '—' },
              { label: 'Area', value: listing.surface ? `${listing.surface} m²` : '—' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', minWidth: isMobile ? '60px' : '70px' }}>
                <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: '#0B1426', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '48px' }}>
            <div className="section-eyebrow" style={{ marginBottom: '12px', color: '#C9A84C', fontSize: isMobile ? '12px' : '14px' }}>About this property</div>
            <p style={{ fontSize: isMobile ? '15px' : '17px', lineHeight: '1.7', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
              {listing.description || 'An exceptional property awaits you.'}
            </p>
          </div>

          {listing.tags?.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <div className="section-eyebrow" style={{ marginBottom: '16px', color: '#C9A84C', fontSize: isMobile ? '12px' : '14px' }}>Highlights</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {listing.tags.map(t => (
                  <span key={t} style={{ background: '#0B1426', color: '#C9A84C', padding: isMobile ? '6px 14px' : '8px 18px', borderRadius: '50px', fontSize: isMobile ? '11px' : '13px', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {listing.host && (
            <div style={{ background: '#0B1426', borderRadius: '16px', padding: isMobile ? '24px' : '32px', display: 'flex', gap: isMobile ? '16px' : '24px', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
              <img
                src={listing.host.users?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.host.users?.full_name || 'Host')}&background=C9A84C&color=fff`}
                alt={listing.host.users?.full_name || 'Host'}
                style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #C9A84C' }}
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=H&background=C9A84C&color=fff`; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? '10px' : '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Your host</div>
                <div style={{ color: '#fff', fontSize: isMobile ? '18px' : '20px', fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                  {listing.host.users?.full_name || 'Host'}
                </div>
                <div style={{ color: '#C9A84C', fontSize: isMobile ? '11px' : '13px', marginTop: '4px' }}>
                  Host since {listing.host.years_since_beginning || 1} year · {reviews.length || 0} reviews
                </div>
              </div>
              <button
                style={{ marginLeft: isMobile ? '0' : 'auto', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', borderRadius: '50px', padding: isMobile ? '8px 16px' : '10px 22px', cursor: 'pointer', fontSize: isMobile ? '13px' : '14px', fontWeight: 600, width: isMobile ? '100%' : 'auto' }}
                onClick={openChatWithHost}
              >
                Contact host
              </button>
            </div>
          )}
          
          {/* Reviews Section */}
          <div style={{ marginBottom: '48px' }}>
            <div className="section-eyebrow" style={{ marginBottom: '16px', color: '#C9A84C', fontSize: isMobile ? '12px' : '14px' }}>Guest reviews</div>
            
            {user && isGuest() ? (
              <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: isMobile ? '20px' : '24px', 
                marginBottom: '32px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#0B1426', marginBottom: '16px' }}>
                  {userReview && !editingReview ? 'Your review' : 'Share your experience'}
                </h3>
                
                {userReview && !editingReview ? (
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <StarRatingDisplay rating={userReview.rating} size={20} />
                    </div>
                    <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '16px', fontSize: isMobile ? '13px' : '14px' }}>{userReview.comment}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button onClick={handleEditReview} style={{ padding: isMobile ? '8px 16px' : '8px 20px', background: 'transparent', border: '1px solid #C9A84C', borderRadius: '8px', color: '#C9A84C', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', fontWeight: 600 }}>✏️ Edit</button>
                      <button onClick={handleDeleteReview} style={{ padding: isMobile ? '8px 16px' : '8px 20px', background: 'transparent', border: '1px solid #dc2626', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', fontWeight: 600 }}>🗑️ Delete</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#0B1426', fontSize: isMobile ? '13px' : '14px' }}>Your rating</label>
                      <StarRatingInput rating={reviewRating} onRatingChange={setReviewRating} size={isMobile ? 24 : 32} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#0B1426', fontSize: isMobile ? '13px' : '14px' }}>Your comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe your stay..."
                        rows="4"
                        style={{
                          width: '100%',
                          padding: isMobile ? '12px' : '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          fontFamily: 'inherit',
                          fontSize: isMobile ? '14px' : '14px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button onClick={handleSubmitReview} disabled={reviewSubmitting} style={{ padding: isMobile ? '10px 20px' : '10px 24px', background: '#C9A84C', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: reviewSubmitting ? 'not-allowed' : 'pointer', opacity: reviewSubmitting ? 0.7 : 1, fontSize: isMobile ? '13px' : '14px' }}>
                        {reviewSubmitting ? 'Sending...' : (userReview ? 'Update' : 'Publish review')}
                      </button>
                      {userReview && editingReview && (
                        <button onClick={handleCancelEdit} style={{ padding: isMobile ? '10px 20px' : '10px 24px', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: '8px', color: '#666', cursor: 'pointer', fontSize: isMobile ? '13px' : '14px' }}>Cancel</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: isMobile ? '30px' : '40px', background: '#fff', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
                <p style={{ color: '#555', marginBottom: '16px', fontSize: isMobile ? '13px' : '14px' }}>🔒 Please login as a guest to leave a review</p>
                <button onClick={() => navigate('/guest')} style={{ padding: isMobile ? '10px 20px' : '10px 24px', background: '#C9A84C', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '13px' : '14px' }}>Go to guest area</button>
              </div>
            )}
            
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '30px' : '40px', background: '#fff', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
                <p style={{ color: '#555', fontSize: isMobile ? '13px' : '14px' }}>⭐ Be the first to leave a review!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map(review => {
                  const isCurrentUserReview = user && isGuest() && review.user_id === user.user_id;
                  
                  return (
                    <div key={review.review_id} style={{ background: '#fff', borderRadius: '12px', padding: isMobile ? '16px' : '20px', border: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0B1426', marginBottom: '4px', fontSize: isMobile ? '13px' : '14px' }}>
                            {review.user_name || `Guest #${review.user_id?.slice(0, 8)}`}
                            {isCurrentUserReview && (
                              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#C9A84C', fontWeight: 400, background: 'rgba(201,168,76,0.1)', padding: '2px 8px', borderRadius: '12px' }}>You</span>
                            )}
                          </div>
                          <StarRatingDisplay rating={review.rating} size={14} showNumber={false} />
                        </div>
                        <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#999' }}>
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <p style={{ color: '#555', lineHeight: '1.6', fontSize: isMobile ? '13px' : '14px', margin: 0 }}>{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <LocationMap location={listing.location} listingName={listing.title} />
        </div>

        {/* RIGHT COLUMN — Booking Card */}
        <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? '0' : '100px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <div style={{ background: '#0B1426', padding: isMobile ? '20px 24px' : '28px 32px' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '11px' : '13px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Price per night</div>
              <div style={{ color: '#fff', fontSize: isMobile ? '32px' : '42px', fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.1, marginTop: '4px' }}>
                {propertyPrice.toLocaleString('fr-DZ')} DA
                <span style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 400, color: '#C9A84C' }}> / night</span>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StarRatingDisplay rating={averageRating} size={14} showNumber={true} />
              </div>
            </div>

            <div style={{ padding: isMobile ? '20px 24px' : '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Check in</label>
                  <input
                    type="date"
                    value={bookingFormData.checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '10px', padding: isMobile ? '10px 12px' : '10px 12px', fontSize: isMobile ? '16px' : '14px', fontFamily: 'inherit', color: '#0B1426', background: '#fafaf8', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Check out</label>
                  <input
                    type="date"
                    value={bookingFormData.checkOut}
                    min={(() => {
                      const dt = new Date(bookingFormData.checkIn);
                      dt.setDate(dt.getDate() + 1);
                      return dt.toISOString().split('T')[0];
                    })()}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '10px', padding: isMobile ? '10px 12px' : '10px 12px', fontSize: isMobile ? '16px' : '14px', fontFamily: 'inherit', color: '#0B1426', background: '#fafaf8', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Guests</label>
                <input
                  type="number"
                  min="1"
                  max={listing.voyageurs || 10}
                  value={bookingFormData.guests}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                  style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '10px', padding: isMobile ? '10px 12px' : '10px 12px', fontSize: isMobile ? '16px' : '14px', fontFamily: 'inherit', color: '#0B1426', background: '#fafaf8', boxSizing: 'border-box' }}
                />
              </div>

              <button
                className="btn-gold"
                style={{ width: '100%', padding: isMobile ? '14px' : '16px', fontSize: isMobile ? '15px' : '16px', fontWeight: 700, borderRadius: '50px', marginTop: '4px', justifyContent: 'center', background: '#C9A84C', color: '#0B1426', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  if (!user || !isGuest()) {
                    showToast('🔒 Please log in as a guest to book');
                    navigate('/login');
                    return;
                  }
                  setBookingOpen(true);
                }}
              >
                Reserve now
              </button>

              <button
                style={{
                  width: '100%', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '13px' : '14px', fontWeight: 600,
                  borderRadius: '50px',
                  background: wishlist ? 'rgba(230,57,70,0.06)' : 'transparent',
                  border: wishlist ? '1px solid rgba(230,57,70,0.4)' : '1px solid #e0e0e0',
                  cursor: saveLoading ? 'wait' : 'pointer',
                  color: wishlist ? '#e63946' : '#666',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onClick={handleToggleSave}
                disabled={saveLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist ? '#e63946' : 'none'} stroke={wishlist ? '#e63946' : 'currentColor'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {saveLoading ? 'Saving…' : wishlist ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={openChatWithHost}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: isMobile ? '12px' : '14px',
                  borderRadius: '50px',
                  border: '1px solid #C9A84C',
                  background: 'transparent',
                  color: '#C9A84C',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              >
                Contact host
              </button>

              <p style={{ textAlign: 'center', fontSize: isMobile ? '11px' : '12px', color: '#999', margin: 0 }}>
                No payment now · Free cancellation within 48h
              </p>
            </div>
          </div>

          {bookingFormData.checkIn && bookingFormData.checkOut && (() => {
            const nights = Math.ceil((new Date(bookingFormData.checkOut) - new Date(bookingFormData.checkIn)) / (1000 * 60 * 60 * 24));
            if (nights > 0 && nights <= 365) {
              return (
                <div style={{ background: '#fff', borderRadius: '16px', padding: isMobile ? '20px' : '24px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price details ({nights} nights)</div>
                  {[
                    [`${propertyPrice.toLocaleString('fr-DZ')} DA × ${nights} nights`, `${(propertyPrice * nights).toLocaleString('fr-DZ')} DA`],
                    ['Cleaning fee', '5,000 DA'],
                    ['Service fee', `${Math.round(propertyPrice * 0.14).toLocaleString('fr-DZ')} DA`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: isMobile ? '12px' : '14px', color: '#555' }}>
                      <span>{label}</span><span>{val}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: isMobile ? '14px' : '15px', color: '#0B1426' }}>
                    <span>Total</span>
                    <span>{(propertyPrice * nights + 5000 + Math.round(propertyPrice * 0.14)).toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Related Properties */}
      {related.length > 0 && (
        <section style={{ background: '#0B1426', padding: isMobile ? '40px 16px' : '80px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center', color: '#C9A84C', marginBottom: '12px', textAlign: 'center', fontSize: isMobile ? '12px' : '14px' }}>Similar properties</div>
            <h2 className="section-title" style={{ color: '#fff', textAlign: 'center', marginBottom: isMobile ? '32px' : '48px', fontSize: isMobile ? 'clamp(28px, 5vw, 36px)' : 'clamp(36px, 4vw, 48px)' }}>You might also <em>like</em></h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'), 
              gap: isMobile ? '20px' : '28px' 
            }}>
              {related.map(l => {
                const relatedPrice = l.price || 0;
                return (
                  <div
                    key={l.property_id}
                    style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    onClick={() => navigate(`/property/${l.property_id}`)}
                  >
                    <img src={l.img?.[0] || 'https://picsum.photos/id/104/600/450'} alt={l.title} style={{ width: '100%', height: isMobile ? '180px' : '200px', objectFit: 'cover', display: 'block' }} onError={e => { e.target.src = 'https://picsum.photos/id/104/600/450'; }} />
                    <div style={{ padding: isMobile ? '16px' : '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: isMobile ? '15px' : '17px', fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#0B1426' }}>{l.title}</div>
                        <div style={{ color: '#C9A84C', fontSize: isMobile ? '12px' : '13px', fontWeight: 700 }}>★ {l.avgRating?.toFixed(1) || 'New'}</div>
                      </div>
                      <div style={{ color: '#666', fontSize: isMobile ? '12px' : '13px', marginBottom: '12px' }}>📍 {l.location}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#0B1426', fontSize: isMobile ? '14px' : '16px' }}>
                          {relatedPrice.toLocaleString('fr-DZ')} DA
                          <span style={{ fontWeight: 400, color: '#999', fontSize: isMobile ? '11px' : '13px' }}> / night</span>
                        </div>
                        <button className="book-btn" onClick={e => { e.stopPropagation(); navigate(`/property/${l.property_id}`); }} style={{ padding: isMobile ? '6px 12px' : '8px 16px', background: '#C9A84C', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#0B1426', fontWeight: 600, fontSize: isMobile ? '12px' : '13px' }}>View</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default PropertyDetailPage;