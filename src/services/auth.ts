import { API_ROUTES } from '@/constants/api-routes';
import apiCaller from '@/lib/api-caller';
import type { SessionSnapshot } from '@/types/auth';
import { UserRole } from '@/types/user';

// ── Request / Response types ─────────────────────────────────────────────────
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface StudentProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  role: 'STUDENT';
  profile_picture: string | null;
  created_at: string;
  bio: string;
  city: string;
  country: string;
  postal_code: string;
  status: string;
  native_language: string;
  learning_language: string;
}

export interface ConsultantProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  role: 'TEACHER';
  has_teacher: boolean;
  has_student: boolean;
  profile_picture: string | null;
  created_at: string;
  bio: string;
  city: string;
  country: string;
  postal_code: string;
  status: string;
  native_language: string;
  learning_language: string;
  qualification: string;
  experience_years: number;
  certificates: string[];
  about: string;
}

export interface UnifiedProfileResponse {
  has_teacher: boolean;
  teacher_profile: ConsultantProfile | null;
  has_student: boolean;
  student_profile: StudentProfile | null;
}

export interface SetRoleResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: 'TEACHER' | 'STUDENT';
  };
}

export interface BecomeRoleResponse {
  message: string;
  created: boolean;
  profile: StudentProfile | ConsultantProfile;
}

// ── API methods ──────────────────────────────────────────────────────────────

/**
 * Auth calls are plain fetches to our own server: Supabase is only contacted
 * from route handlers, so no token ever passes through the browser bundle.
 */
async function authRequest<T extends SessionSnapshot = SessionSnapshot>(
  action: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`/api/auth/${action}`, {
    method: body === undefined ? 'GET' : 'POST',
    ...(body === undefined
      ? null
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    credentials: 'same-origin',
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || 'Authentication request failed');
  }

  return data;
}

export const authApi = {
  login: (email: string, password: string) =>
    authRequest('login', { email, password }),

  signup: (email: string, password: string, full_name: string) =>
    authRequest('signup', { email, password, full_name }),

  logout: () => authRequest('logout', {}),

  /** Verified session plus server-resolved roles — replaces cookie reads. */
  session: () => authRequest('session'),

  /** Re-reads roles from the backend after become-teacher / set-role etc. */
  syncRoles: () => authRequest('sync-roles', {}),

  setActiveRole: (role: UserRole) => authRequest('active-role', { role }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    authRequest('forgot-password', { email: data.email }),

  /** Completes a reset on the live recovery session — no token involved. */
  resetPassword: (password: string) => authRequest('reset-password', { password }),

  resendVerificationEmail: (data: ResendVerificationEmailRequest) =>
    authRequest('resend-verification', { email: data.email }),

  exchangeCode: (code: string) => authRequest('exchange-code', { code }),

  changePassword: (currentPassword: string, newPassword: string) =>
    authRequest('change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  googleOAuthStart: (redirectTo?: string) =>
    authRequest('google-oauth-start', { redirectTo }),

  googleIdToken: (credential: string, nonce: string) =>
    authRequest('google-id-token', { credential, nonce }),

  /** Short-lived credential for the chat WebSocket handshake. */
  wsToken: async (): Promise<string> => {
    const { token } = await authRequest('ws-token', {});
    if (!token) throw new Error('No credential available');
    return token;
  },

  getUnifiedProfile: async (): Promise<UnifiedProfileResponse> => {
    const response = await apiCaller(API_ROUTES.AUTH.ME, 'GET', undefined, {}, true);
    return response.data;
  },

  /**
   * Finalize the role for a new Google/One-Tap user, then refresh the
   * server-held role cookies so middleware and the UI agree on it.
   */
  setRole: async (role: 'TEACHER' | 'STUDENT'): Promise<SetRoleResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.SET_ROLE,
      'POST',
      { role } as Record<string, string>,
      {},
      true
    );
    return response.data;
  },

  becomeConsultant: async (): Promise<BecomeRoleResponse> => {
    const response = await apiCaller(API_ROUTES.AUTH.BECOME_TEACHER, 'POST', {}, {}, true);
    return response.data;
  },

  becomeStudent: async (): Promise<BecomeRoleResponse> => {
    const response = await apiCaller(API_ROUTES.AUTH.BECOME_STUDENT, 'POST', {}, {}, true);
    return response.data;
  },
};
