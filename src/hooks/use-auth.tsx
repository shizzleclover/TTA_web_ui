'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { login as apiLogin, register as apiRegister, getMe, AuthResponse } from '@/lib/auth-api';

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
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    api.setToken(data.accessToken);
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
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        api.setToken(token);
        try {
          const data = await getMe();
          handleAuthResponse(data);
        } catch (error) {
          logout();
        }
      } else {
        setStatus('unauthenticated');
      }
    };
    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const data = await apiLogin(identifier, password);
      handleAuthResponse(data);
    } catch (error) {
      logout();
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
