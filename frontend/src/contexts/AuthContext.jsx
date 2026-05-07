import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({ remaining: 0, limit: 0, resetDate: null });
  const { addToast } = useToast();

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      if (response.data.user.quota) {
        setQuota(response.data.user.quota);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuota = useCallback(async () => {
    try {
      const response = await api.get('/auth/quota');
      setQuota(response.data);
      if (response.data.remaining < 5 && response.data.remaining > 0) {
        addToast(`You have only ${response.data.remaining} credits left!`, 'warning');
      } else if (response.data.remaining === 0) {
        addToast('Document limit reached. Please contact admin or upgrade plan.', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch quota', error);
    }
  }, [addToast]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      await fetchQuota();
      addToast('Welcome back!', 'success');
      return { success: true };
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      setUser(response.data.user);
      addToast('Account created successfully!', 'success');
      return { success: true };
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      addToast('Logged out successfully', 'info');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      addToast('Password reset link sent to your email', 'success');
      return { success: true };
    } catch (error) {
      addToast(error.message || 'Failed to send reset link', 'error');
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      addToast('Password reset successfully! Please login.', 'success');
      return { success: true };
    } catch (error) {
      addToast(error.message || 'Password reset failed', 'error');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchQuota();
    }
  }, [user, fetchQuota]);

  const value = {
    user,
    loading,
    quota,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    fetchQuota,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};