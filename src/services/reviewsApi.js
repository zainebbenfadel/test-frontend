// src/services/reviewsApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get all reviews for a property
export const getReviews = async (propertyId) => {
  try {
    // ✅ CORRECT URL - reviews route is mounted at /api/reviews
    const url = `${API_BASE}/api/reviews/properties/${propertyId}/reviews`;
    console.log('🔍 Fetching reviews from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      throw new Error(`Failed to fetch reviews: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Reviews data received:', data);
    return data.reviews || [];
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    throw error;
  }
};

// Add a new review
export const addReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Get average rating for a property
export const getAverageRating = async (propertyId) => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews/properties/${propertyId}/reviews/average`);
    if (!response.ok) {
      throw new Error('Failed to fetch average rating');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching average rating:', error);
    throw error;
  }
};