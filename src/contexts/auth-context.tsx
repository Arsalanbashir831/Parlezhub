'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  clearAuthCookies,
  getActiveRole,
  getCookie,
  getUserRoles,
  setActiveRole,
  setCookie,
  setUserRoles,
} from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';

import type { User } from '../lib/types';
import {
  authApi,
  ResendVerificationEmailRequest,
  type ForgotPasswordRequest,
  type LoginRequest,
  type ResetPasswordRequest,
  type SignupRequest,
  type UnifiedProfileResponse,
} from '../services/auth';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  googleOAuthInitiate: (
    mode: 'login' | 'signup',
    role?: 'TEACHER' | 'STUDENT'
  ) => Promise<void>;
  switchRole: (role: 'TEACHER' | 'STUDENT') => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  becomeConsultant: () => Promise<void>;
  becomeStudent: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRoles: ('TEACHER' | 'STUDENT')[];
  activeRole: 'TEACHER' | 'STUDENT' | null;
  userRole: 'TEACHER' | 'STUDENT' | null; // Keep for backward compatibility
  hasTeacherRole: boolean;
  hasStudentRole: boolean;
  canAccessRole: (role: 'TEACHER' | 'STUDENT') => boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUserRole: (role: 'TEACHER' | 'STUDENT' | null) => void; // Keep for backward compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRolesState] = useState<('TEACHER' | 'STUDENT')[]>(
    []
  );
  const [activeRole, setActiveRoleState] = useState<
    'TEACHER' | 'STUDENT' | null
  >(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Computed values for backward compatibility and convenience
  const userRole = activeRole; // For backward compatibility
  const hasTeacherRole = userRoles.includes('TEACHER');
  const hasStudentRole = userRoles.includes('STUDENT');
  const canAccessRole = (role: 'TEACHER' | 'STUDENT') =>
    userRoles.includes(role);

  // Function to update roles from unified profile response
  const updateRolesFromProfile = useCallback(
    (profileData: UnifiedProfileResponse) => {
      const availableRoles: ('TEACHER' | 'STUDENT')[] = [];

      if (profileData.has_teacher) {
        availableRoles.push('TEACHER');
      }
      if (profileData.has_student) {
        availableRoles.push('STUDENT');
      }

      setUserRolesState(availableRoles);
      setUserRoles(availableRoles);

      // Set active role - prefer current active role if valid, otherwise use first available
      const currentActiveRole = getActiveRole();
      let newActiveRole: 'TEACHER' | 'STUDENT' | null = null;

      if (currentActiveRole && availableRoles.includes(currentActiveRole)) {
        newActiveRole = currentActiveRole;
        setActiveRoleState(currentActiveRole);
      } else if (availableRoles.length > 0) {
        newActiveRole = availableRoles[0];
        setActiveRoleState(newActiveRole);
        setActiveRole(newActiveRole);
      }

      // Keep backward compatibility cookie with the correct role
      if (newActiveRole) {
        setCookie('user_role', newActiveRole);
      }
    },
    []
  );

  // Function to refresh user profile
  const refreshUserProfile = useCallback(async () => {
    try {
      const profileData = await authApi.getUnifiedProfile();
      updateRolesFromProfile(profileData);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      throw error;
    }
  }, [updateRolesFromProfile]);

  // Function to switch active role
  const switchRole = async (role: 'TEACHER' | 'STUDENT') => {
    if (!canAccessRole(role)) {
      throw new Error(`You don't have access to ${role} role`);
    }

    setActiveRoleState(role);
    setActiveRole(role);
    setCookie('user_role', role); // For backward compatibility

    // Redirect to appropriate dashboard
    if (role === 'STUDENT') {
      router.push(ROUTES.STUDENT.DASHBOARD);
    } else {
      router.push(ROUTES.TEACHER.DASHBOARD);
    }

    toast.success(`Switched to ${role.toLowerCase()} mode`);
  };

  // TanStack Query mutations
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (data) => {
      // Store tokens in cookies
      setCookie('access_token', data.access_token);
      setCookie('refresh_token', data.refresh_token);

      setError(null);

      try {
        // Get unified profile to determine available roles before setting authenticated
        await refreshUserProfile();

        // Only set authenticated after profile is loaded
        setIsAuthenticated(true);

        // Show success toast
        toast.success(`Welcome back!`);

        // Redirect based on active role
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          const currentActiveRole = getActiveRole();
          if (currentActiveRole === 'TEACHER') {
            router.push(ROUTES.TEACHER.DASHBOARD);
          } else if (currentActiveRole === 'STUDENT') {
            router.push(ROUTES.STUDENT.DASHBOARD);
          } else {
            // Default to student dashboard if no active role set
            router.push(ROUTES.STUDENT.DASHBOARD);
          }
        }
      } catch (profileError) {
        console.error('Failed to load profile after login:', profileError);
        // Fallback to old behavior
        setCookie('user_role', data.user.role);
        setUserRolesState([data.user.role]);
        setActiveRoleState(data.user.role);
        setIsAuthenticated(true);
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
    onSuccess: () => {
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
    onSuccess: () => {
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

  const googleOAuthInitiateMutation = useMutation({
    mutationFn: () => authApi.googleInitiate(),
    onSuccess: () => {
      setError(null);
      // The GoogleOAuthButton component will handle the redirect
    },
    onError: (error: unknown) => {
      console.error('Google OAuth initiate failed:', error);
      const errorMessage = getErrorMessage(error, 'google-oauth');
      setError(errorMessage);
      toast.error('Google Authentication Failed', {
        description: errorMessage,
      });
    },
  });

  const becomeConsultantMutation = useMutation({
    mutationFn: () => authApi.becomeConsultant(),
    onSuccess: async (data) => {
      setError(null);

      // Refresh profile to get updated roles
      await refreshUserProfile();

      // Set consultant as active role and redirect (no validation needed since API succeeded)
      setActiveRoleState('TEACHER');
      setActiveRole('TEACHER');
      setCookie('user_role', 'TEACHER');

      // Redirect to consultant dashboard
      router.push(ROUTES.TEACHER.DASHBOARD);

      const message = data.created
        ? 'Consultant profile created successfully!'
        : 'Welcome back to consultant mode!';
      toast.success(message);
    },
    onError: (error: unknown) => {
      console.error('Become consultant failed:', error);
      const errorMessage = getErrorMessage(error, 'become-consultant');
      setError(errorMessage);
      toast.error('Failed to Become Consultant', {
        description: errorMessage,
      });
    },
  });

  const becomeStudentMutation = useMutation({
    mutationFn: () => authApi.becomeStudent(),
    onSuccess: async (data) => {
      setError(null);

      // Refresh profile to get updated roles
      await refreshUserProfile();

      // Set student as active role and redirect (no validation needed since API succeeded)
      setActiveRoleState('STUDENT');
      setActiveRole('STUDENT');
      setCookie('user_role', 'STUDENT');

      // Redirect to student dashboard
      router.push(ROUTES.STUDENT.DASHBOARD);

      const message = data.created
        ? 'Student profile created successfully!'
        : 'Welcome back to student mode!';
      toast.success(message);
    },
    onError: (error: unknown) => {
      console.error('Become student failed:', error);
      const errorMessage = getErrorMessage(error, 'become-student');
      setError(errorMessage);
      toast.error('Failed to Become Student', {
        description: errorMessage,
      });
    },
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = getCookie('access_token');
        const storedRoles = getUserRoles();
        const storedActiveRole = getActiveRole();

        if (token) {
          setIsAuthenticated(true);

          if (storedRoles.length > 0) {
            setUserRolesState(storedRoles);
            if (storedActiveRole && storedRoles.includes(storedActiveRole)) {
              setActiveRoleState(storedActiveRole);
            } else {
              setActiveRoleState(storedRoles[0]);
            }

            // Try to refresh profile to get latest data
            try {
              await refreshUserProfile();
            } catch {
              console.log(
                'Could not refresh profile on init, using stored data'
              );
            }
          } else {
            // No stored roles, try to fetch profile
            try {
              await refreshUserProfile();
            } catch {
              // If we can't get profile, fall back to clearing auth
              console.error('Failed to get profile, clearing auth');
              clearAuthCookies();
              setIsAuthenticated(false);
              setUserRolesState([]);
              setActiveRoleState(null);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserRolesState([]);
          setActiveRoleState(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserRolesState([]);
        setActiveRoleState(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [refreshUserProfile, router, searchParams]);

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = () => {
    // Clear all auth cookies
    clearAuthCookies();

    setIsAuthenticated(false);
    setUserRolesState([]);
    setActiveRoleState(null);
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
      redirect_to:
        typeof window !== 'undefined'
          ? `${window.location.origin}${ROUTES.AUTH.CALLBACK}`
          : undefined,
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

  const googleOAuthInitiate = async (
    mode: 'login' | 'signup',
    role?: 'TEACHER' | 'STUDENT'
  ) => {
    if (mode === 'signup' && !role) {
      toast.error('Please select a role before continuing with Google signup');
      return;
    }

    // Store the mode and role in sessionStorage for the callback
    sessionStorage.setItem('oauth_mode', mode);
    if (role) {
      sessionStorage.setItem('oauth_role', role);
    }

    await googleOAuthInitiateMutation.mutateAsync();
  };

  // Backward compatibility function
  const setUserRole = (role: 'TEACHER' | 'STUDENT' | null) => {
    if (role) {
      setActiveRoleState(role);
      setActiveRole(role);
      setCookie('user_role', role);
    } else {
      setActiveRoleState(null);
    }
  };

  const becomeConsultant = async () => {
    await becomeConsultantMutation.mutateAsync();
  };

  const becomeStudent = async () => {
    await becomeStudentMutation.mutateAsync();
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
        googleOAuthInitiate,
        switchRole,
        refreshUserProfile,
        becomeConsultant,
        becomeStudent,
        isLoading:
          isLoading ||
          loginMutation.isPending ||
          signupMutation.isPending ||
          forgotPasswordMutation.isPending ||
          resetPasswordMutation.isPending ||
          resendVerificationEmailMutation.isPending ||
          googleOAuthInitiateMutation.isPending ||
          becomeConsultantMutation.isPending ||
          becomeStudentMutation.isPending,
        error,
        isAuthenticated,
        userRoles,
        activeRole,
        userRole, // For backward compatibility
        hasTeacherRole,
        hasStudentRole,
        canAccessRole,
        setIsAuthenticated,
        setUserRole, // For backward compatibility
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
