import React, { useState, useEffect } from 'react';
import { getUserConversations } from '../services/messagedAPI.js';
import ChatModal from './chatModal.jsx';

function ChatList({ currentUser, showToast }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentUser?.user_id) {
      loadConversations();
    }
  }, [currentUser]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getUserConversations(currentUser.user_id);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      showToast?.('❌ Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: isMobile ? '12px 16px' : '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px' }}>💬 Messages</h3>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          Chargement...
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: isMobile ? '40px 20px' : '60px 20px', textAlign: 'center', color: '#999' }}>
          <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '16px' }}>💬</div>
          <p style={{ fontSize: isMobile ? '14px' : '16px' }}>Aucune conversation</p>
          <p style={{ fontSize: isMobile ? '12px' : '13px' }}>
            Les conversations commencent après une réservation
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {conversations.map((conv) => {
            const otherUser = conv.other_user;
            return (
              <div
                key={conv.conversation_id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: isMobile ? '12px 16px' : '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  gap: isMobile ? '10px' : '12px',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <img
                  src={otherUser?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.full_name || 'U')}&background=C9A84C&color=fff`}
                  alt={otherUser?.full_name}
                  style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <strong style={{ color: '#0B1426', fontSize: isMobile ? '14px' : '16px' }}>{otherUser?.full_name}</strong>
                    <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#999' }}>
                      {conv.last_message_at && new Date(conv.last_message_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: isMobile ? '12px' : '13px',
                    color: '#666',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {conv.last_message || 'Nouvelle conversation'}
                  </p>
                  <p style={{
                    margin: '2px 0 0',
                    fontSize: isMobile ? '10px' : '11px',
                    color: '#C9A84C',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    🏠 {conv.properties?.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedConversation && (
        <ChatModal
          conversation={selectedConversation}
          currentUser={currentUser}
          onClose={() => setSelectedConversation(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default ChatList;