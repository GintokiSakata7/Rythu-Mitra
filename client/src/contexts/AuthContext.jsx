import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [officialProfile, setOfficialProfile] = useState(null);
  const [token, setToken] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('mm_token') : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    async function loadSession() {
      const storedToken = localStorage.getItem('mm_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.me();
        setUser(data.user);
        setOfficialProfile(data.officialProfile || null);
        setToken(storedToken);
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err.message);
        localStorage.removeItem('mm_token');
        setUser(null);
        setOfficialProfile(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('mm_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setOfficialProfile(data.officialProfile || null);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (payload) => {
    setAuthError(null);
    try {
      const data = await api.register(payload);
      localStorage.setItem('mm_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setOfficialProfile(data.officialProfile || null);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await api.me();
      setUser(data.user);
      setOfficialProfile(data.officialProfile || null);
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('mm_token');
    setUser(null);
    setOfficialProfile(null);
    setToken(null);
    setAuthError(null);
    try {
      api.logout();
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        officialProfile,
        token,
        loading,
        authError,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isOfficial: user?.role === 'official',
        isVerifiedOfficial: user?.role === 'official' && officialProfile?.verificationStatus === 'APPROVED',
        login,
        register,
        refreshProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
