// src/pages/WishlistPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';

function WishlistPage({ showToast }) {
  const navigate = useNavigate();
  const { user, isGuest, getGuestId } = useAuth();
  const hasLoaded = useRef(false); // Prevent double loading

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});

  // Redirect if not a guest
  if (!user || !isGuest()) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    // Prevent double loading in React Strict Mode
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    const loadWishlist = async () => {
      const guestId = getGuestId();
      console.log('Loading wishlist for guestId:', guestId);
      
      if (!guestId) {
        console.error('No guest ID found');
        showToast('❌ Guest ID not found');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const items = await getWishlist(guestId);
        console.log('Loaded wishlist items:', items);
        setWishlistItems(items);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        showToast(`❌ Failed to load wishlist: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlist();
  }, [getGuestId, showToast]); // Remove user.user_id dependency

  const handleRemove = async (e, propertyId) => {
    e.stopPropagation();
    const guestId = getGuestId();
    
    if (!guestId) return;
    
    setRemoving(prev => ({ ...prev, [propertyId]: true }));
    try {
      await removeFromWishlist(guestId, propertyId);
      setWishlistItems(prev => prev.filter(item => item.property_id !== propertyId));
      showToast('💔 Removed from wishlist');
    } catch (err) {
      console.error('Remove error:', err);
      showToast(`❌ ${err.message}`);
    } finally {
      setRemoving(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  const getFirstImage = (property) => {
    if (!property) return 'https://picsum.photos/id/104/600/450';
    if (Array.isArray(property.img) && property.img.length > 0) return property.img[0];
    if (typeof property.img === 'string') return property.img;
    return 'https://picsum.photos/id/104/600/450';
  };

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', background: '#f7f4ef' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <button
            onClick={() => navigate('/guest')}
            style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.35)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >←</button>
          <div>
            <div style={{ color: '#c9a84c', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Guest Profile</div>
            <h1 style={{ color: '#1a1a2e', fontSize: 26, fontWeight: 700, margin: 0 }}>My Wishlist</h1>
          </div>
          {!loading && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#c9a84c',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 600,
            }}>
              {wishlistItems.length} saved
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❤️</div>
            <p>Loading your saved properties…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && wishlistItems.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: '#fff', borderRadius: 20,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
            <h3 style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No saved properties yet</h3>
            <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: 14, marginBottom: 24 }}>
              Browse stays and click the heart ❤️ to save your favourites here.
            </p>
            <button
              onClick={() => navigate('/stays')}
              style={{
                background: '#c9a84c', color: '#fff', border: 'none',
                borderRadius: 12, padding: '12px 28px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Browse Stays
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && wishlistItems.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {wishlistItems.map(item => {
              const property = item.property || {};
              const propertyId = item.property_id;
              const isRemoving = removing[propertyId];

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                  }}
                  onClick={() => navigate(`/property/${propertyId}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden' }}>
                    <img
                      src={getFirstImage(property)}
                      alt={property.title || 'Property'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.src = 'https://picsum.photos/id/104/600/450'; }}
                    />
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: 'rgba(230,57,70,0.9)',
                      color: '#fff',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      ❤️ Saved
                    </div>
                    <button
                      onClick={(e) => handleRemove(e, propertyId)}
                      disabled={isRemoving}
                      title="Remove from wishlist"
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(0,0,0,0.45)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isRemoving ? 'wait' : 'pointer',
                        transition: 'background 0.2s',
                        backdropFilter: 'blur(4px)',
                        padding: 0,
                        color: '#fff',
                        fontSize: 16,
                      }}
                      onMouseEnter={e => { if (!isRemoving) e.currentTarget.style.background = 'rgba(230,57,70,0.85)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
                    >
                      {isRemoving ? '…' : '✕'}
                    </button>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
                        {property.title || 'Property'}
                      </h3>
                      {property.reviews?.rating && (
                        <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                          ★ {property.reviews.rating}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#717171', margin: '0 0 6px 0' }}>
                      📍 {property.wilaya || property.location || '—'}
                    </p>
                    {(property.chambres || property.salle_de_bain || property.voyageurs) && (
                      <p style={{ fontSize: 12, color: '#999', margin: '0 0 10px 0' }}>
                        {property.chambres && `🛏️ ${property.chambres} bed`}
                        {property.salle_de_bain && ` • 🚿 ${property.salle_de_bain} bath`}
                        {property.voyageurs && ` • 👥 ${property.voyageurs} guests`}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {property.price && (
                        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15 }}>
                          {Math.round(property.price * 240).toLocaleString('fr-DZ')} DA
                          <span style={{ fontWeight: 400, color: '#999', fontSize: 12 }}> / nuit</span>
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>
                        Saved {new Date(item.added_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}
                      </div>
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

export default WishlistPage;