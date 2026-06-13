import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedHost = localStorage.getItem('host_user');
    const savedGuest = localStorage.getItem('guest_user');
    return savedHost ? JSON.parse(savedHost) : savedGuest ? JSON.parse(savedGuest) : null;
  });

  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('user_type') || null;
  });

  const [loading, setLoading] = useState(false);

  const _setHost = (hostData) => {
    const hostUser = { ...hostData, userType: 'host' };
    localStorage.setItem('host_user', JSON.stringify(hostUser));
    localStorage.setItem('user_type', 'host');
    localStorage.removeItem('guest_user');
    localStorage.removeItem('guest');
    setUser(hostUser);
    setUserType('host');
    return hostUser;
  };

  const _setGuest = (guestData) => {
    const guestUser = {
      ...guestData,
      userType: 'guest',
      user_id: guestData.guest_id,
      id: guestData.guest_id,
      civil_state: guestData.civil_state || null,
    };
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    localStorage.setItem('user_type', 'guest');
    localStorage.removeItem('host_user');
    localStorage.setItem('guest', JSON.stringify(guestUser));
    setUser(guestUser);
    setUserType('guest');
    return guestUser;
  };

  // Host functions
  const hostLogin = async (credentials) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hosts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      _setHost(data.host);
      return data;
    } catch (error) {
      console.error('Host login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hostSignup = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hosts/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      _setHost(data.host);
      return data;
    } catch (error) {
      console.error('Host signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Guest functions
  const guestLogin = async (credentials) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/guests/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
      }
      
      _setGuest(data.guest);
      return data;
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const guestSignup = async (userData) => {
    setLoading(true);
    try {
      console.log('Sending signup request to:', `${API_BASE_URL}/api/guests/signup`);
      console.log('User data:', userData);
      
      const res = await fetch(`${API_BASE_URL}/api/guests/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      console.log('Response status:', res.status);
      console.log('Response data:', data);
      
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      _setGuest(data.guest);
      return data;
    } catch (error) {
      console.error('Guest signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGuestData = (updatedFields) => {
    const merged = { ...user, ...updatedFields };
    localStorage.setItem('guest_user', JSON.stringify(merged));
    localStorage.setItem('guest', JSON.stringify(merged));
    setUser(merged);
  };

  const getGuestId = () => {
    if (user && userType === 'guest') {
      return user.guest_id || user.user_id || user.id;
    }
    return null;
  };

  const getHostId = () => {
    if (user && userType === 'host') {
      return user.host_id || user.user_id;
    }
    return null;
  };

  const logout = async () => {
    try {
      const session = localStorage.getItem('supabase_session');
      if (session) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${JSON.parse(session).access_token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('host_user');
      localStorage.removeItem('guest_user');
      localStorage.removeItem('user_type');
      localStorage.removeItem('guest');
      localStorage.removeItem('supabase_session');
      setUser(null);
      setUserType(null);
    }
  };

  const isHost = () => userType === 'host';
  const isGuest = () => userType === 'guest';

  return (
    <AuthContext.Provider value={{
      user, 
      userType, 
      loading,
      setUser,
      hostLogin, 
      hostSignup,
      guestLogin, 
      guestSignup,
      updateGuestData,
      logout, 
      isHost, 
      isGuest,
      getGuestId,
      getHostId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}