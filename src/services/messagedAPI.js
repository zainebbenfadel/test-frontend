// src/services/messagedAPI.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://test-backend-hd6i.onrender.com';

export const getOrCreateConversation = async (guest_id, host_id, property_id) => {
  const response = await fetch(`${API_BASE}/api/messages/conversations`, {  // ✅ Added /api
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guest_id, host_id, property_id })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Backend error:", data);
    throw new Error(data.error || 'Erreur lors de la création de la conversation');
  }

  return data;
};

export const getUserConversations = async (userId) => {
  const response = await fetch(`${API_BASE}/api/messages/conversations/user/${userId}`);  // ✅ Added /api
  if (!response.ok) throw new Error('Erreur lors du chargement des conversations');
  return response.json();
};

export const getMessages = async (conversationId, userId) => {
  const response = await fetch(`${API_BASE}/api/messages/conversations/${conversationId}/messages?userId=${userId}`);  // ✅ Added /api
  if (!response.ok) throw new Error('Erreur lors du chargement des messages');
  return response.json();
};

export const sendMessage = async (conversation_id, sender_id, receiver_id, booking_id, message) => {
  const response = await fetch(`${API_BASE}/api/messages/messages`, {  // ✅ Added /api
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id, sender_id, receiver_id, booking_id, message })
  });
  if (!response.ok) throw new Error('Erreur lors de l\'envoi du message');
  return response.json();
};

export const markMessagesAsRead = async (conversationId, userId) => {
  const response = await fetch(`${API_BASE}/api/messages/conversations/${conversationId}/read`, {  // ✅ Added /api
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!response.ok) throw new Error('Erreur lors du marquage des messages');
  return response.json();
};