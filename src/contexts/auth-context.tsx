'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  authApi,
  type ForgotPasswordRequest,
  type LoginRequest,
  type ResetPasswordRequest,
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
  isAuthenticated: boolean;
  userRole: 'TEACHER' | 'STUDENT' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to set cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Helper function to get cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to remove cookies
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // TanStack Query mutations
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      console.log('Login successful:', data);

      // Store tokens in localStorage and cookies
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_role', data.user.role);

      setCookie('access_token', data.access_token);
      setCookie('refresh_token', data.refresh_token);
      setCookie('user_role', data.user.role);

      setIsAuthenticated(true);
      setUserRole(data.user.role);
      setError(null);

      // Redirect based on role
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        if (data.user.role === 'STUDENT') {
          router.push(ROUTES.STUDENT.DASHBOARD);
        } else if (data.user.role === 'TEACHER') {
          router.push(ROUTES.TEACHER.DASHBOARD);
        }
      }
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
      // Redirect to login after successful signup
      router.push(ROUTES.AUTH.LOGIN);
    },
    onError: (error: Error) => {
      console.error('Signup failed:', error);
      setError(error.message || 'Signup failed');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      console.log('Forgot password request successful:', data);
      setError(null);
    },
    onError: (error: Error) => {
      console.error('Forgot password failed:', error);
      setError(error.message || 'Failed to send reset email');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: (data) => {
      console.log('Password reset successful:', data);
      setError(null);
      // Redirect to login after successful password reset
      router.push(ROUTES.AUTH.LOGIN);
    },
    onError: (error: Error) => {
      console.error('Password reset failed:', error);
      setError(error.message || 'Failed to reset password');
    },
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem('access_token') || getCookie('access_token');
        const role =
          localStorage.getItem('user_role') || getCookie('user_role');

        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(role as 'TEACHER' | 'STUDENT');
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
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    // Clear cookies
    removeCookie('access_token');
    removeCookie('refresh_token');
    removeCookie('user_role');

    setIsAuthenticated(false);
    setUserRole(null);
    setError(null);

    // Redirect to login
    router.push(ROUTES.AUTH.LOGIN);
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
    await forgotPasswordMutation.mutateAsync({ email });
  };

  const resetPassword = async (token: string, new_password: string) => {
    await resetPasswordMutation.mutateAsync({ token, new_password });
  };

  const verifyEmail = async (token: string) => {
    // Implementation for email verification
    console.log('Verify email with token:', token);
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        signup,
        forgotPassword,
        resetPassword,
        verifyEmail,
        isLoading:
          isLoading ||
          loginMutation.isPending ||
          signupMutation.isPending ||
          forgotPasswordMutation.isPending ||
          resetPasswordMutation.isPending,
        error:
          error ||
          loginMutation.error?.message ||
          signupMutation.error?.message ||
          forgotPasswordMutation.error?.message ||
          resetPasswordMutation.error?.message ||
          null,
        isAuthenticated,
        userRole,
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
