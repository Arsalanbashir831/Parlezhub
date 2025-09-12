import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'TEACHER' | 'STUDENT';
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
};
