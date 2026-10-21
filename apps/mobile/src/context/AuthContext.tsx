import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { storage } from '../utils/storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; message: string; cooldownSeconds?: number }>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const storedToken = await storage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          await storage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
    } catch {
      await storage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const sendOtp = async (phoneNumber: string) => {
    return await api.sendOtp(phoneNumber);
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    const res = await api.verifyOtp(phoneNumber, otp);
    if (res.success && res.token) {
      await storage.setItem('auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = async () => {
    await storage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        sendOtp,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
