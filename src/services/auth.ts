import { API_ROUTES } from '@/constants/api-routes';
import { ROUTES } from '@/constants/routes';
import apiCaller from '@/lib/api-caller';

// ── Request / Response types ─────────────────────────────────────────────────
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
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

export interface SyncUserResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: 'TEACHER' | 'STUDENT' | 'BOTH' | null;
    auth_provider: string;
    email_verified: boolean;
  };
  requires_role_selection?: boolean;
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

// ── API methods ───────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Sync the authenticated Supabase user to Django.
   * Called after every successful auth (email login, Google OAuth, One-Tap).
   * Django creates/updates the local User and UserProfile records.
   */
  syncUser: async (accessToken: string, role?: 'TEACHER' | 'STUDENT'): Promise<SyncUserResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.SYNC,
      'POST',
      { access_token: accessToken, ...(role ? { role } : {}) } as Record<string, string>,
      {
        // Explicitly set the Authorization header so the interceptor doesn't
        // need to fetch a session (which may not be in cookies yet for brand-new
        // One-Tap / OAuth users). The sync endpoint itself validates the token
        // via the Supabase admin client on the backend.
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      false // permission_classes=[AllowAny] on the backend — no DRF auth needed
    );
    return response.data;
  },

  /**
   * Finalize role for new Google/One-Tap users.
   * Called from /onboarding/choose-role page after the user selects their role.
   */
  setRole: async (role: 'TEACHER' | 'STUDENT'): Promise<SetRoleResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.SET_ROLE,
      'POST',
      { role } as Record<string, string>,
      {},
      true // Requires Authorization header (user is already authenticated)
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}${ROUTES.AUTH.RESET_PASSWORD}`,
    });

    if (error) {
      const err = new Error(error.message);
      (err as any).response = { data: { error: error.message } };
      throw err;
    }

    return { message: 'Password reset link sent to your email.' };
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: data.new_password,
    });

    if (error) {
      const err = new Error(error.message);
      (err as any).response = { data: { error: error.message } };
      throw err;
    }

    return { message: 'Password has been reset successfully.' };
  },

  resendVerificationEmail: async (
    data: ResendVerificationEmailRequest
  ): Promise<{ message: string }> => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}${ROUTES.AUTH.CALLBACK}`,
      },
    });

    if (error) {
      const err = new Error(error.message);
      (err as any).response = { data: { error: error.message } };
      throw err;
    }

    return { message: 'Verification email has been resent.' };
  },

  getUnifiedProfile: async (): Promise<UnifiedProfileResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.ME,
      'GET',
      undefined,
      {},
      true
    );
    return response.data;
  },

  becomeConsultant: async (): Promise<BecomeRoleResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.BECOME_TEACHER,
      'POST',
      {},
      {},
      true
    );
    return response.data;
  },

  becomeStudent: async (): Promise<BecomeRoleResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.BECOME_STUDENT,
      'POST',
      {},
      {},
      true
    );
    return response.data;
  },
};
