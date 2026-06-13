// src/services/wishlistApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://test-backend-hd6i.onrender.com';

export const addToWishlist = async (guestId, propertyId) => {
  const response = await fetch(`${API_BASE}/api/wishlist`, {  // ✅ Added /api
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guest_id: guestId, property_id: propertyId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add to wishlist');
  }
  return response.json();
};

export const removeFromWishlist = async (guestId, propertyId) => {
  const response = await fetch(`${API_BASE}/api/wishlist`, {  // ✅ Added /api
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guest_id: guestId, property_id: propertyId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove from wishlist');
  }
  return response.json();
};

export const getWishlist = async (guestId) => {
  const response = await fetch(`${API_BASE}/api/wishlist/${guestId}`);  // ✅ Added /api
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch wishlist');
  }
  return response.json();
};

export const getWishlistIds = async (guestId) => {
  const wishlist = await getWishlist(guestId);
  return wishlist.map(item => item.property_id);
};