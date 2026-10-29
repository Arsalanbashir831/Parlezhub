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

import { getErrorMessage } from '@/lib/error-utils';
import { landingPathFor, rolesNeedRecheck } from '@/lib/guard-rules';

import type { SessionSnapshot } from '@/types/auth';
import type { User, UserRole } from '@/types/user';
import {
  authApi,
  BecomeRoleResponse,
  type ForgotPasswordRequest,
  type ResendVerificationEmailRequest,
} from '../services/auth';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (password: string) => Promise<{ message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ message: string }>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
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
  /** True until the server resolves roles, so guards can wait instead of bouncing. */
  rolesUnknown: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_RECHECK_ATTEMPTS = 2;
const ROLE_RECHECK_DELAY_MS = 500;

/**
 * Roles can lag the backend profile row for a moment right after sign-in. A
 * bounded re-read keeps that window on a loading state instead of flashing the
 * role picker at somebody who already has a role.
 */
async function settleRoles(snapshot: SessionSnapshot): Promise<SessionSnapshot> {
  let current = snapshot;

  for (
    let attempt = 0;
    attempt < ROLE_RECHECK_ATTEMPTS && rolesNeedRecheck(current);
    attempt++
  ) {
    await new Promise((resolve) => setTimeout(resolve, ROLE_RECHECK_DELAY_MS));
    try {
      current = await authApi.syncRoles();
    } catch (err) {
      console.error('Role lookup still failing:', err);
      break;
    }
  }

  return current;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Session and roles come from /api/auth/session, so the first paint is
  // identical on server and client — no cookie peeking, no hydration mismatch.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRolesState] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [rolesUnknown, setRolesUnknown] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const applySession = useCallback((snapshot: SessionSnapshot) => {
    setIsAuthenticated(snapshot.isAuthenticated);
    setUserRolesState(snapshot.userRoles);
    setActiveRoleState(snapshot.activeRole);
    setRolesUnknown(snapshot.rolesUnknown === true);
  }, []);

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setUserRolesState([]);
    setActiveRoleState(null);
    setRolesUnknown(false);
  }, []);

  // Computed values
  const userRole = activeRole;
  const hasTeacherRole = userRoles.includes('TEACHER');
  const hasStudentRole = userRoles.includes('STUDENT');
  const canAccessRole = (role: UserRole) => userRoles.includes(role);

  useEffect(() => {
    let cancelled = false;

    authApi
      .session()
      .then(async (snapshot) => {
        const settled = await settleRoles(snapshot);
        if (!cancelled) applySession(settled);
      })
      .catch((err: unknown) => {
        console.error('Auth init failed:', err);
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  /** Re-reads roles from the backend after anything that can change them. */
  const refreshUserProfile = useCallback(async () => {
    try {
      applySession(await authApi.syncRoles());
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      throw err;
    }
  }, [applySession]);

  // ── Role switcher ─────────────────────────────────────────────────────────
  const switchRole = async (role: 'TEACHER' | 'STUDENT') => {
    if (!canAccessRole(role)) {
      throw new Error(`You don't have access to ${role} role`);
    }
    const snapshot = await authApi.setActiveRole(role);
    applySession(snapshot);
    router.push(role === 'STUDENT' ? ROUTES.STUDENT.DASHBOARD : ROUTES.TEACHER.DASHBOARD);
    toast.success(`Switched to ${role.toLowerCase()} mode`);
  };

  // ── Auth actions ───────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      let snapshot = await authApi.login(email, password);

      // Settle roles before navigating: the guards land on a resolved answer,
      // so nobody is routed through onboarding to a dashboard they own.
      snapshot = await settleRoles(snapshot);

      applySession(snapshot);
      toast.success('Welcome back!');

      router.push(landingPathFor(snapshot, searchParams.get('redirect')));
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'login');
      setError(msg);
      toast.error('Login Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User>, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.signup(userData.email!, password, userData.username || '');

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
   * Google OAuth sign-in. The PKCE exchange, Django sync and role cookies are
   * all handled by /auth/callback on the server.
   */
  const signInWithGoogle = async (redirectTo?: string) => {
    const { url } = await authApi.googleOAuthStart(redirectTo);
    if (!url) {
      toast.error('Google Sign-In Failed', { description: 'No authorization URL returned' });
      return;
    }
    window.location.href = url;
  };

  const logout = async () => {
    await authApi.logout();
    clearSession();
    setError(null);
    toast.success('Logged Out Successfully');
    router.push(ROUTES.AUTH.LOGIN);
  };

  // ── Password flows ────────────────────────────────────────────────────────
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
    mutationFn: (password: string) => authApi.resetPassword(password),
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
      toast.error('Failed to Resend', {
        description: getErrorMessage(err, 'resend-verification-email'),
      });
    },
  });

  const becomeConsultantMutation = useMutation({
    mutationFn: () => authApi.becomeConsultant(),
    onSuccess: async () => {
      await refreshUserProfile();
      applySession(await authApi.setActiveRole('TEACHER'));
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
      applySession(await authApi.setActiveRole('STUDENT'));
      router.push(ROUTES.STUDENT.DASHBOARD);
      toast.success('Student profile created!');
    },
    onError: (err: unknown) => {
      toast.error('Failed to Become Student', {
        description: getErrorMessage(err, 'become-student'),
      });
    },
  });

  const forgotPassword = async (email: string) => {
    await forgotPasswordMutation.mutateAsync({ email });
    return { message: 'Password reset link sent to your email.' };
  };

  const resetPassword = async (password: string) => {
    await resetPasswordMutation.mutateAsync(password);
    return { message: 'Password has been reset successfully.' };
  };

  const resendVerificationEmail = async (email: string) => {
    await resendVerificationEmailMutation.mutateAsync({ email });
    return { message: 'Verification email has been resent.' };
  };

  const becomeConsultant = async () => becomeConsultantMutation.mutateAsync();
  const becomeStudent = async () => becomeStudentMutation.mutateAsync();

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
        rolesUnknown,
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
