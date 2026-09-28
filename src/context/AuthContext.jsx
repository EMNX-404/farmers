import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = apiClient.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to load profile from token:', err.message);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('marketlink_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('marketlink_auth_expired', handleAuthExpired);
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    return res;
  };

  const registerCustomer = async (payload) => {
    const res = await authService.registerCustomer(payload);
    setUser(res.user);
    return res;
  };

  const registerFarmer = async (payload) => {
    const res = await authService.registerFarmer(payload);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  };

  const value = {
    user,
    token: apiClient.getToken(),
    loading,
    isAuthenticated: Boolean(user),
    isCustomer: user?.role === 'customer',
    isFarmer: user?.role === 'farmer',
    isAdmin: user?.role === 'admin',
    login,
    registerCustomer,
    registerFarmer,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
