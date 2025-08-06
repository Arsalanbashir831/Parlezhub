'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  authApi,
  type LoginRequest,
  type SignupRequest,
} from '@/services/auth';
import { useMutation } from '@tanstack/react-query';

import type { User } from '../lib/types';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TanStack Query mutations
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      // Store only user role for profile fetching
      localStorage.setItem('user_role', data.user.role);

      setError(null);
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (data) => {
      console.log('Signup successful:', data);
      setError(null);
    },
    onError: (error: Error) => {
      console.error('Signup failed:', error);
      setError(error.message || 'Signup failed');
    },
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setError(null);
  };

  const signup = async (userData: Partial<User>, password: string) => {
    const signupData: SignupRequest = {
      email: userData.email || '',
      password,
      full_name: userData.username || '',
      role:
        (userData.role?.toUpperCase() as 'TEACHER' | 'STUDENT') || 'STUDENT',
    };

    await signupMutation.mutateAsync(signupData);
  };

  const forgotPassword = async (email: string) => {
    // API call to backend
    console.log('Forgot password for:', email);
  };

  const resetPassword = async (token: string, password: string) => {
    // API call to backend
    console.log('Reset password with token:', token);
  };

  const verifyEmail = async (token: string) => {
    // API call to backend
    console.log('Verify email with token:', token);
  };

  // Combine loading states
  const combinedLoading =
    isLoading || loginMutation.isPending || signupMutation.isPending;
  const combinedError =
    error ||
    loginMutation.error?.message ||
    signupMutation.error?.message ||
    null;

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        signup,
        forgotPassword,
        resetPassword,
        verifyEmail,
        isLoading: combinedLoading,
        error: combinedError,
      }}
    >
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
