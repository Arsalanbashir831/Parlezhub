'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  authApi,
  ResendVerificationEmailRequest,
  type ForgotPasswordRequest,
  type LoginRequest,
  type ResetPasswordRequest,
  type SignupRequest,
} from '@/services/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getCookie, removeCookie, setCookie } from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';

import type { User } from '../lib/types';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: 'TEACHER' | 'STUDENT' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      // Store tokens in cookies only
      setCookie('access_token', data.access_token);
      setCookie('refresh_token', data.refresh_token);
      setCookie('user_role', data.user.role);

      setIsAuthenticated(true);
      setUserRole(data.user.role);
      setError(null);

      // Show success toast
      toast.success(`Welcome back!`, {
        description: `Redirecting to your ${data.user.role.toLowerCase()} dashboard...`,
      });

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
    onError: (error: unknown) => {
      console.error('Login failed:', error);
      const errorMessage = getErrorMessage(error, 'login');
      setError(errorMessage);
      toast.error('Login Failed', {
        description: errorMessage,
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (data, variables) => {
      setError(null);

      // Show success toast
      toast.success('Account Created Successfully!', {
        description:
          'Please check your email to verify your account before signing in.',
      });

      // Redirect to login after successful signup
      const emailParam = variables?.email
        ? `?email=${encodeURIComponent(variables.email)}`
        : '';
      router.push(ROUTES.AUTH.VERIFY_EMAIL + emailParam);
    },
    onError: (error: unknown) => {
      console.error('Signup failed:', error);
      const errorMessage = getErrorMessage(error, 'signup');
      setError(errorMessage);
      toast.error('Signup Failed', {
        description: errorMessage,
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      setError(null);

      // Show success toast
      toast.success('Reset Email Sent!', {
        description: 'Please check your email for password reset instructions.',
      });
    },
    onError: (error: unknown) => {
      console.error('Forgot password failed:', error);
      const errorMessage = getErrorMessage(error, 'forgot-password');
      setError(errorMessage);
      toast.error('Failed to Send Reset Email', {
        description: errorMessage,
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: (data) => {
      setError(null);

      // Show success toast
      toast.success('Password Reset Successful!', {
        description: 'You can now sign in with your new password.',
      });

      // Redirect to login after successful password reset
      router.push(ROUTES.AUTH.LOGIN);
    },
    onError: (error: unknown) => {
      console.error('Password reset failed:', error);
      const errorMessage = getErrorMessage(error, 'reset-password');
      setError(errorMessage);
      toast.error('Password Reset Failed', {
        description: errorMessage,
      });
    },
  });

  const resendVerificationEmailMutation = useMutation({
    mutationFn: (data: ResendVerificationEmailRequest) =>
      authApi.resendVerificationEmail(data),
    mutationKey: ['resend-verification-email'],
    onSuccess: () => {
      setError(null);

      // Show success toast
      toast.success('Verification Email Sent!', {
        description: 'Please check your email for verification instructions.',
      });
    },
    onError: (error: unknown) => {
      console.error('Resend verification email failed:', error);
      const errorMessage = getErrorMessage(error, 'resend-verification-email');
      setError(errorMessage);
      toast.error('Failed to Resend Verification Email', {
        description: errorMessage,
      });
    },
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = getCookie('access_token');
        const role = getCookie('user_role');

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
    // Clear cookies only
    removeCookie('access_token');
    removeCookie('refresh_token');
    removeCookie('user_role');

    setIsAuthenticated(false);
    setUserRole(null);
    setError(null);

    // Show logout toast
    toast.success('Logged Out Successfully', {
      description: 'You have been logged out of your account.',
    });

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

  const resetPassword = async (token: string, password: string) => {
    await resetPasswordMutation.mutateAsync({ token, new_password: password });
  };

  const resendVerificationEmail = async (email: string) => {
    await resendVerificationEmailMutation.mutateAsync({ email });
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        signup,
        forgotPassword,
        resetPassword,
        resendVerificationEmail,
        isLoading:
          isLoading ||
          loginMutation.isPending ||
          signupMutation.isPending ||
          forgotPasswordMutation.isPending ||
          resetPasswordMutation.isPending ||
          resendVerificationEmailMutation.isPending,
        error,
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
