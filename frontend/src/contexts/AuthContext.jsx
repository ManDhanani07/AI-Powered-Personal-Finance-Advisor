import React, { createContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/index.js';
import { getItem, setItem, removeItem } from '../utils/storage.js';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => getItem(STORAGE_KEYS.AUTH_TOKEN) || null);
  const [refreshToken, setRefreshToken] = useState(() => getItem(STORAGE_KEYS.REFRESH_TOKEN) || null);
  const [user, setUser] = useState(() => getItem(STORAGE_KEYS.USER_DATA) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getItem(STORAGE_KEYS.AUTH_TOKEN)));
  const [isLoading, setIsLoading] = useState(() => Boolean(getItem(STORAGE_KEYS.AUTH_TOKEN) && !getItem(STORAGE_KEYS.USER_DATA)));

  /**
   * Clear session state & local storage
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    removeItem(STORAGE_KEYS.AUTH_TOKEN);
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    removeItem(STORAGE_KEYS.USER_DATA);
    removeItem(STORAGE_KEYS.LAST_ROLE);
    removeItem(STORAGE_KEYS.LAST_DASHBOARD);
    try {
      sessionStorage.clear();
    } catch {}
  }, []);

  /**
   * Save session tokens & user profile
   */
  const saveAuthState = useCallback((tokens, userData = null) => {
    try {
      sessionStorage.clear();
    } catch {}
    if (tokens?.access_token) {
      setAccessToken(tokens.access_token);
      setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.access_token);
    }
    if (tokens?.refresh_token) {
      setRefreshToken(tokens.refresh_token);
      setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    if (userData) {
      setUser(userData);
      setItem(STORAGE_KEYS.USER_DATA, userData);
      const isAdmin = Boolean(
        (userData.email && userData.email.toLowerCase() === 'fintech0707@gmail.com') ||
        userData.role?.toUpperCase() === 'ADMIN'
      );
      setItem(STORAGE_KEYS.LAST_ROLE, isAdmin ? 'ADMIN' : 'USER');
      setItem(STORAGE_KEYS.LAST_DASHBOARD, isAdmin ? '/admin/overview' : '/dashboard');
    }
    setIsAuthenticated(true);
  }, []);

  /**
   * Fetch current user profile on app startup (supports URL query token callback)
   */
  const loadCurrentUser = useCallback(async () => {
    // Check if redirected from Google OAuth callback with tokens in URL query
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAccess = urlParams.get('access_token');
      const urlRefresh = urlParams.get('refresh_token');
      if (urlAccess) {
        setItem(STORAGE_KEYS.AUTH_TOKEN, urlAccess);
        setAccessToken(urlAccess);
        if (urlRefresh) {
          setItem(STORAGE_KEYS.REFRESH_TOKEN, urlRefresh);
          setRefreshToken(urlRefresh);
        }
        // Clean URL query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('URL token parse notice:', e);
    }

    const token = getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      if (!getItem(STORAGE_KEYS.USER_DATA)) {
        setIsLoading(true);
      }
      const res = await authService.getCurrentUser();
      const userData = res?.data?.data ?? res?.data;
      if (userData && (userData.id || userData.email)) {
        setUser(userData);
        setItem(STORAGE_KEYS.USER_DATA, userData);
        const isAdmin = Boolean(
          (userData.email && userData.email.toLowerCase() === 'fintech0707@gmail.com') ||
          userData.role?.toUpperCase() === 'ADMIN'
        );
        setItem(STORAGE_KEYS.LAST_ROLE, isAdmin ? 'ADMIN' : 'USER');
        setItem(STORAGE_KEYS.LAST_DASHBOARD, isAdmin ? '/admin/overview' : '/dashboard');
        setIsAuthenticated(true);
      } else {
        clearAuthState();
      }
    } catch (err) {
      console.warn('Session verification notice (clearing unauthenticated state):', err);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  useEffect(() => {
    loadCurrentUser();

    const handleGlobalLogout = () => {
      clearAuthState();
    };

    window.addEventListener('auth:logout', handleGlobalLogout);
    return () => window.removeEventListener('auth:logout', handleGlobalLogout);
  }, [loadCurrentUser, clearAuthState]);

  /**
   * User Login Action
   */
  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password, remember_me: rememberMe });
      if (res?.data?.tokens) {
        saveAuthState(res.data.tokens, res.data.user);
        return res.data;
      }
      throw new Error(res?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User Registration Action
   */
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(userData);
      if (res?.data?.tokens) {
        saveAuthState(res.data.tokens, res.data.user);
        return res.data;
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User Logout Action
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API call error:', err);
    } finally {
      clearAuthState();
      setIsLoading(false);
    }
  };

  /**
   * Forgot Password Action
   */
  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  /**
   * Reset Password Action
   */
  const resetPassword = async (token, newPassword) => {
    return await authService.resetPassword(token, newPassword);
  };

  /**
   * Change Password Action
   */
  const changePassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(oldPassword, newPassword);
  };

  /**
   * Google OAuth Login Action
   */
  const googleLogin = async (idToken) => {
    setIsLoading(true);
    try {
      const res = await authService.googleLogin(idToken);
      const payload = res?.data ?? res;
      if (payload?.tokens) {
        saveAuthState(payload.tokens, payload.user);
        return payload;
      }
      throw new Error(payload?.message || 'Google OAuth failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Optimistically update user fields in state without full page reload
   */
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...updatedFields };
      setItem(STORAGE_KEYS.USER_DATA, merged);
      const isAdmin = Boolean(
        (merged.email && merged.email.toLowerCase() === 'fintech0707@gmail.com') ||
        merged.role?.toUpperCase() === 'ADMIN'
      );
      setItem(STORAGE_KEYS.LAST_ROLE, isAdmin ? 'ADMIN' : 'USER');
      setItem(STORAGE_KEYS.LAST_DASHBOARD, isAdmin ? '/admin/overview' : '/dashboard');
      return merged;
    });
  }, []);

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    loadCurrentUser,
    updateUser,
    saveAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
