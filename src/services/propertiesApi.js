// src/services/propertiesApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchProperties = async () => {
  try {
    console.log('📡 Fetching properties from:', `${API_BASE}/api/properties`);
    const res = await fetch(`${API_BASE}/api/properties`);
    
    if (!res.ok) {
      console.error('Response status:', res.status);
      throw new Error(`Failed to fetch properties: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Fetched properties:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const fetchPropertyById = async (id) => {
  try {
    console.log('📡 Fetching property from:', `${API_BASE}/api/properties/${id}`);
    const res = await fetch(`${API_BASE}/api/properties/${id}`);
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch property: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Property fetched:', data.title);
    return data;
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    throw error;
  }
};