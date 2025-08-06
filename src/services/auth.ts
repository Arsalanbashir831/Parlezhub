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
};
