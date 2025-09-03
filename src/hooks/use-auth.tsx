'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { login as apiLogin, register as apiRegister, getMe, AuthResponse, refreshAccessToken } from '@/lib/auth-api';

interface User {
  id: string;
  username: string;
  email: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const handleAuthResponse = (data: AuthResponse) => {
    if (data?.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      api.setToken(data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data?.user) {
      setUser(data.user);
    }
    setStatus('authenticated');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    api.setToken(null);
    setStatus('unauthenticated');
  };

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!token && refresh) {
          // try refresh first if only refreshToken is present
          const refreshed = await refreshAccessToken();
          if (cancelled) return;
          handleAuthResponse(refreshed);
          // fetch user if not present in refresh response
          if (!refreshed.user?.id) {
            const me = await getMe();
            if (cancelled) return;
            handleAuthResponse(me);
          }
          return;
        }

        if (token) {
          api.setToken(token);
          try {
            const me = await getMe();
            if (cancelled) return;
            handleAuthResponse(me);
          } catch (e: any) {
            console.log('Auth initialization: getMe failed, attempting refresh:', e.message);
            // token might be expired, attempt refresh if refresh token exists
            if (refresh) {
              try {
                const refreshed = await refreshAccessToken();
                if (cancelled) return;
                handleAuthResponse(refreshed);
                if (!refreshed.user?.id) {
                  const me2 = await getMe();
                  if (cancelled) return;
                  handleAuthResponse(me2);
                }
              } catch (refreshError: any) {
                console.log('Auth initialization: refresh failed:', refreshError.message);
                logout();
              }
            } else {
              console.log('Auth initialization: no refresh token, logging out');
              logout();
            }
          }
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        logout();
      }
    };

    initializeAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        const newToken = e.newValue;
        if (!newToken) {
          // token removed in another tab
          logout();
        } else {
          api.setToken(newToken);
          // Do not force fetch /me here to avoid loops; next page action will fetch.
        }
      }
      if (e.key === REFRESH_TOKEN_KEY && !e.newValue) {
        // refresh token removed: ensure logout
        logout();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      console.log('Auth context: Starting login process');
      const data = await apiLogin(identifier, password);
      console.log('Auth context: Login API call successful', data);
      handleAuthResponse(data);
      // Ensure api client has token immediately
      if (data.accessToken) {
        api.setToken(data.accessToken);
      }
      // Ensure user present
      if (!data.user?.id) {
        console.log('Auth context: Fetching user details from /me');
        const me = await getMe();
        handleAuthResponse(me);
      }
      console.log('Auth context: Login process completed successfully');
    } catch (error) {
      console.error('Auth context: Login failed', error);
      // Don't call logout() here as it might cause unwanted redirects
      // Just throw the error and let the UI handle it
      throw error;
    }
  };

  const register = async (username: string, password: string, email: string) => {
    try {
      await apiRegister(username, password, email);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
