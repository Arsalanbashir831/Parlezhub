import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'TEACHER' | 'STUDENT';
  redirect_to?: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'TEACHER' | 'STUDENT';
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'TEACHER' | 'STUDENT';
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface ResendVerificationEmailResponse {
  message: string;
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
  role: 'STUDENT'; // Note: role might still be STUDENT even with consultant profile
  has_consultant: boolean;
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
  has_consultant: boolean;
  consultant_profile: ConsultantProfile | null;
  has_student: boolean;
  student_profile: StudentProfile | null;
}

export interface GoogleInitiateResponse {
  success: boolean;
  oauth_url: string;
  message: string;
}

export interface GoogleCallbackRequest {
  access_token: string;
  refresh_token: string;
  role?: 'TEACHER' | 'STUDENT'; // Required for signup, optional for login
}

export interface GoogleCallbackResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string;
    role?: 'TEACHER' | 'STUDENT'; // Made optional for role selection cases
    auth_provider: string;
    email_verified: boolean;
    is_oauth_user: boolean;
    created_at: string;
  };
  access_token?: string;
  refresh_token?: string;
  created?: boolean;
  is_existing_user_login?: boolean;
  requires_profile_completion?: boolean;
  flow_type?: 'login' | 'signup';
  // Error case fields
  error?: string;
  requires_role_selection?: boolean;
}

export interface BecomeRoleResponse {
  message: string;
  created: boolean;
  profile: StudentProfile | ConsultantProfile;
}

export const authApi = {
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.SIGNUP,
      'POST',
      data as unknown as Record<string, string>,
      {},
      false // Don't use auth token for signup
    );
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.LOGIN,
      'POST',
      data as unknown as Record<string, string>,
      {},
      false // Don't use auth token for login
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      'POST',
      data as unknown as Record<string, string>,
      {},
      false // Don't use auth token for forgot password
    );
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.RESET_PASSWORD,
      'POST',
      data as unknown as Record<string, string>,
      {},
      false // Don't use auth token for reset password
    );
    return response.data;
  },

  resendVerificationEmail: async (
    data: ResendVerificationEmailRequest
  ): Promise<ResendVerificationEmailResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.RESEND_VERIFICATION_EMAIL,
      'POST',
      data as unknown as Record<string, string>,
      {},
      false // Don't use auth token for resend verification email
    );
    return response.data;
  },

  googleInitiate: async (): Promise<GoogleInitiateResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.GOOGLE_INITIATE,
      'POST',
      {},
      {},
      false // Don't use auth token for Google initiate
    );
    return response.data;
  },

  googleCallback: async (
    data: GoogleCallbackRequest
  ): Promise<GoogleCallbackResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.GOOGLE_CALLBACK,
      'POST',
      data as unknown as Record<string, string>,
      {},
      false // Don't use auth token for Google callback
    );
    return response.data;
  },

  getUnifiedProfile: async (): Promise<UnifiedProfileResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.ME,
      'GET',
      undefined,
      {},
      true // Use auth token for profile access
    );
    return response.data;
  },

  becomeConsultant: async (): Promise<BecomeRoleResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.BECOME_TEACHER,
      'POST',
      {},
      {},
      true // Use auth token
    );
    return response.data;
  },

  becomeStudent: async (): Promise<BecomeRoleResponse> => {
    const response = await apiCaller(
      API_ROUTES.AUTH.BECOME_STUDENT,
      'POST',
      {},
      {},
      true // Use auth token
    );
    return response.data;
  },
};
