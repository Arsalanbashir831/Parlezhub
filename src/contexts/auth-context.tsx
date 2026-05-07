'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getActiveRole,
  getUserRoles,
  setActiveRole,
  setUserRoles,
  clearAuthCookies,
} from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';
import { createClient } from '@/lib/supabase/client';
import { tokenStore } from '@/lib/token-store';

import type { User, UserRole } from '@/types/user';
import {
  authApi,
  BecomeRoleResponse,
  type ForgotPasswordRequest,
  type ResendVerificationEmailRequest,
  type ResetPasswordRequest,
  type UnifiedProfileResponse,
} from '../services/auth';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    userData: Partial<User>,
    password: string
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ message: string }>;
  signInWithGoogle: () => Promise<void>;
  switchRole: (role: 'TEACHER' | 'STUDENT') => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  becomeConsultant: () => Promise<BecomeRoleResponse>;
  becomeStudent: () => Promise<BecomeRoleResponse>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRoles: UserRole[];
  activeRole: UserRole | null;
  userRole: UserRole | null;
  hasTeacherRole: boolean;
  hasStudentRole: boolean;
  canAccessRole: (role: UserRole) => boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Pre-populate from cookies synchronously so the page renders without a loader on refresh.
  // Session validity is confirmed asynchronously in the background.
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof document === 'undefined') return true;
    return getUserRoles().length === 0;
  });
  const isRefreshingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof document === 'undefined') return false;
    return getUserRoles().length > 0;
  });
  const [userRoles, setUserRolesState] = useState<(UserRole)[]>(() => {
    if (typeof document === 'undefined') return [];
    return getUserRoles();
  });
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(() => {
    if (typeof document === 'undefined') return null;
    return getActiveRole();
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Computed values
  const userRole = activeRole;
  const hasTeacherRole = userRoles.includes('TEACHER');
  const hasStudentRole = userRoles.includes('STUDENT');
  const canAccessRole = (role: UserRole) => userRoles.includes(role);

  // ── Role helpers ───────────────────────────────────────────────────────────
  const updateRolesFromProfile = useCallback(
    (profileData: UnifiedProfileResponse) => {
      const availableRoles: (UserRole)[] = [];
      if (profileData.has_teacher) availableRoles.push('TEACHER');
      if (profileData.has_student) availableRoles.push('STUDENT');

      // If both are present, also add BOTH to match user's new types
      if (profileData.has_teacher && profileData.has_student) {
        availableRoles.push('BOTH');
      }

      setUserRolesState(availableRoles);
      setUserRoles(availableRoles);

      const currentActiveRole = getActiveRole();
      let newActiveRole: UserRole | null = null;

      // If current role is still valid, keep it. 
      // Note: If teacher profile was deleted, availableRoles won't have TEACHER, 
      // so this will fall through to the else block.
      if (currentActiveRole && availableRoles.includes(currentActiveRole as UserRole)) {
        newActiveRole = currentActiveRole as UserRole;
      } else if (availableRoles.length > 0) {
        // Default to STUDENT if available, otherwise first available
        newActiveRole = availableRoles.includes('STUDENT') ? 'STUDENT' : (availableRoles[0] as UserRole);
      }

      setActiveRoleState(newActiveRole);
      if (newActiveRole) {
        setActiveRole(newActiveRole);
      }
    },
    []
  );

  const refreshUserProfile = useCallback(async (force = false) => {
    if (isRefreshingRef.current && !force) return;
    isRefreshingRef.current = true;

    try {
      const profileData = await authApi.getUnifiedProfile();
      updateRolesFromProfile(profileData);
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      throw err;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [updateRolesFromProfile]);

  // ── Supabase session listener ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setIsAuthenticated(true);
          tokenStore.set(session.access_token, session.expires_at ?? Math.floor(Date.now() / 1000) + 3600);

          // Roles may already be pre-populated from cookies (synchronous useState init).
          // Only fetch from the API when cookies are genuinely absent.
          const storedRoles = getUserRoles();
          if (storedRoles.length === 0) {
            try {
              await refreshUserProfile(true);
            } catch (err) {
              console.error('Failed to fetch roles during init:', err);
            }
          }
        } else {
          // Session invalid or expired — clear everything
          tokenStore.clear();
          setIsAuthenticated(false);
          setUserRolesState([]);
          setActiveRoleState(null);
        }
      } catch (err) {
        console.error('Auth init failed:', err);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          tokenStore.set(session.access_token, session.expires_at ?? Math.floor(Date.now() / 1000) + 3600);
          try {
            // Attempt to load profile from Django.
            // This may fail with "User not found" if the user just signed up via
            // One-Tap/Google and the sync hasn't completed yet.
            // That's fine — the One-Tap component calls syncUser first, THEN
            // manually fetches the profile and redirects. So we just silently skip.
            await refreshUserProfile();
          } catch {
            // Non-fatal — the One-Tap/OAuth flow handles sync+redirect itself
          }
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          // Keep the in-memory token cache up to date so the Axios interceptor
          // always has the fresh token without needing to call getSession().
          tokenStore.set(session.access_token, session.expires_at ?? Math.floor(Date.now() / 1000) + 3600);
        }

        if (event === 'SIGNED_OUT') {
          tokenStore.clear();
          setIsAuthenticated(false);
          setUserRolesState([]);
          setActiveRoleState(null);
          clearAuthCookies();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Role switcher ─────────────────────────────────────────────────────────
  const switchRole = async (role: 'TEACHER' | 'STUDENT') => {
    if (!canAccessRole(role)) {
      throw new Error(`You don't have access to ${role} role`);
    }
    setActiveRoleState(role);
    setActiveRole(role);
    router.push(role === 'STUDENT' ? ROUTES.STUDENT.DASHBOARD : ROUTES.TEACHER.DASHBOARD);
    toast.success(`Switched to ${role.toLowerCase()} mode`);
  };

  // ── Auth actions ───────────────────────────────────────────────────────────

  /**
   * Email/Password Login
   * Calls Supabase SDK directly — no Django login endpoint needed.
   * After a successful sign-in, the middleware auto-syncs the session cookies.
   * We then call Django /api/auth/sync/ to ensure the user record exists.
   */
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.session) throw new Error('No session returned');

      // Sync user record in Django (idempotent)
      await authApi.syncUser(data.session.access_token);

      await refreshUserProfile(true);
      setIsAuthenticated(true);
      toast.success('Welcome back!');

      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const currentActiveRole = getActiveRole();
        router.push(
          currentActiveRole === 'TEACHER'
            ? ROUTES.TEACHER.DASHBOARD
            : ROUTES.STUDENT.DASHBOARD
        );
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'login');
      setError(msg);
      toast.error('Login Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Email/Password Signup
   * Calls Supabase SDK directly — no Django register endpoint needed.
   * After sign-up, Supabase sends a verification email.
   * The /auth/callback route handler does the Django sync after verification.
   */
  const signup = async (
    userData: Partial<User>,
    password: string
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email!,
        password,
        options: {
          data: {
            full_name: userData.username || '',
            first_name: userData.username?.split(' ')[0] || '',
            last_name: userData.username?.split(' ').slice(1).join(' ') || '',
          },
          emailRedirectTo: `${window.location.origin}${ROUTES.AUTH.CALLBACK}`,
        },
      });

      if (signUpError) throw signUpError;

      setError(null);
      toast.success('Account Created Successfully!', {
        description: 'Please check your email to verify your account before signing in.',
      });

      const emailParam = userData.email
        ? `?email=${encodeURIComponent(userData.email)}`
        : '';
      router.push(ROUTES.AUTH.VERIFY_EMAIL + emailParam);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'signup');
      setError(msg);
      toast.error('Signup Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google OAuth Sign-In (PKCE flow)
   * Supabase redirects to /auth/callback which handles the rest.
   */
  const signInWithGoogle = async () => {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${ROUTES.AUTH.CALLBACK}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (oauthError) {
      toast.error('Google Sign-In Failed', { description: oauthError.message });
    }
    // Supabase redirects the browser — no further action needed here
  };

  /**
   * Logout
   * Calls Supabase SDK — clears the managed session cookies automatically.
   */
  const logout = async () => {
    await supabase.auth.signOut();
    clearAuthCookies();
    setIsAuthenticated(false);
    setUserRolesState([]);
    setActiveRoleState(null);
    setError(null);
    toast.success('Logged Out Successfully');
    router.push(ROUTES.AUTH.LOGIN);
  };

  // ── Password flows (still call Django which proxies to Supabase) ──────────
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: () => {
      toast.success('Reset Email Sent!', {
        description: 'Please check your email for password reset instructions.',
      });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'forgot-password');
      setError(msg);
      toast.error('Failed to Send Reset Email', { description: msg });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Password Reset Successful!', {
        description: 'You can now sign in with your new password.',
      });
      router.push(ROUTES.AUTH.LOGIN);
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'reset-password');
      setError(msg);
      toast.error('Password Reset Failed', { description: msg });
    },
  });

  const resendVerificationEmailMutation = useMutation({
    mutationFn: (data: ResendVerificationEmailRequest) =>
      authApi.resendVerificationEmail(data),
    onSuccess: () => {
      toast.success('Verification Email Sent!');
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'resend-verification-email');
      setError(msg);
      toast.error('Failed to Resend', { description: msg });
    },
  });

  const becomeConsultantMutation = useMutation({
    mutationFn: () => authApi.becomeConsultant(),
    onSuccess: async () => {
      await refreshUserProfile();
      setActiveRoleState('TEACHER');
      setActiveRole('TEACHER');
      router.push(ROUTES.TEACHER.DASHBOARD);
      toast.success('Consultant profile created!');
    },
    onError: (err: unknown) => {
      toast.error('Failed to Become Consultant', {
        description: getErrorMessage(err, 'become-consultant'),
      });
    },
  });

  const becomeStudentMutation = useMutation({
    mutationFn: () => authApi.becomeStudent(),
    onSuccess: async () => {
      await refreshUserProfile();
      setActiveRoleState('STUDENT');
      setActiveRole('STUDENT');
      router.push(ROUTES.STUDENT.DASHBOARD);
      toast.success('Student profile created!');
    },
    onError: (err: unknown) => {
      toast.error('Failed to Become Student', {
        description: getErrorMessage(err, 'become-student'),
      });
    },
  });

  const forgotPassword = async (email: string) =>
    forgotPasswordMutation.mutateAsync({ email });

  const resetPassword = async (token: string, password: string) =>
    resetPasswordMutation.mutateAsync({ token, new_password: password });

  const resendVerificationEmail = async (email: string) =>
    resendVerificationEmailMutation.mutateAsync({ email });

  const becomeConsultant = async () => becomeConsultantMutation.mutateAsync();
  const becomeStudent = async () => becomeStudentMutation.mutateAsync();

  const setUserRole = (role: UserRole | null) => {
    if (role) {
      setActiveRoleState(role);
      setActiveRole(role);
    } else {
      setActiveRoleState(null);
    }
  };

  const isMutationLoading =
    forgotPasswordMutation.isPending ||
    resetPasswordMutation.isPending ||
    resendVerificationEmailMutation.isPending ||
    becomeConsultantMutation.isPending ||
    becomeStudentMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        signup,
        forgotPassword,
        resetPassword,
        resendVerificationEmail,
        signInWithGoogle,
        switchRole,
        refreshUserProfile,
        becomeConsultant,
        becomeStudent,
        isLoading: isLoading || isMutationLoading,
        error,
        isAuthenticated,
        userRoles,
        activeRole,
        userRole,
        hasTeacherRole,
        hasStudentRole,
        canAccessRole,
        setIsAuthenticated,
        setUserRole,
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
