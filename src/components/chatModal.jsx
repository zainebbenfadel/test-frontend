import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import { getMessages, sendMessage, markMessagesAsRead } from '../services/messagedAPI.js';

export function ChatModal({ conversation, currentUser, onClose, showToast }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const otherUser = conversation.other_user;

  // Charger les messages
  useEffect(() => {
    loadMessages();
    markAsRead();
    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [conversation.conversation_id]);

  const subscriptionRef = useRef(null);

  const setupRealtimeSubscription = () => {
    subscriptionRef.current = supabase
      .channel(`messages:${conversation.conversation_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.conversation_id}`
      }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.sender_id !== currentUser.user_id) {
          setMessages(prev => [...prev, newMsg]);
          markAsRead();
        }
      })
      .subscribe();
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(
        conversation.conversation_id,
        currentUser.user_id
      );
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast?.('❌ Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(conversation.conversation_id, currentUser.user_id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const receiver_id = currentUser.user_id === conversation.guest_id 
        ? conversation.host_id 
        : conversation.guest_id;

      const sentMessage = await sendMessage(
        conversation.conversation_id,
        currentUser.user_id,
        receiver_id,
        conversation.booking_id,
        newMessage
      );

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      showToast?.('❌ Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          height: '80vh',
          maxHeight: '700px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: '#0B1426',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={otherUser?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.full_name || 'U')}&background=C9A84C&color=fff`}
              alt={otherUser?.full_name}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{otherUser?.full_name}</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                {conversation.properties?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Chargement...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Aucun message. Commencez la conversation !
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.sender_id === currentUser.user_id;
              return (
                <div
                  key={msg.message_id || index}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: '18px',
                      background: isOwn ? '#C9A84C' : 'white',
                      color: isOwn ? '#0B1426' : '#333',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '14px', wordWrap: 'break-word' }}>
                      {msg.message}
                    </p>
                    <div
                      style={{
                        fontSize: '10px',
                        marginTop: '4px',
                        opacity: 0.6,
                        textAlign: isOwn ? 'right' : 'left'
                      }}
                    >
                      {formatDate(msg.created_at)}
                      {isOwn && (
                        <span style={{ marginLeft: '4px' }}>
                          {msg.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: '16px 20px',
            background: 'white',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Écrivez votre message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '25px',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            style={{
              padding: '10px 20px',
              background: '#C9A84C',
              color: '#0B1426',
              border: 'none',
              borderRadius: '25px',
              cursor: (sending || !newMessage.trim()) ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: (sending || !newMessage.trim()) ? 0.6 : 1
            }}
          >
            {sending ? '...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;