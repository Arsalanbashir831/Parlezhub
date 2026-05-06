import { AxiosError } from 'axios';

/**
 * Extracts a meaningful error message from various error types
 */
export const getErrorMessage = (error: unknown, context?: string): string => {
  if (error instanceof AxiosError) {
    if (!error.response && error.request) {
      return 'Network error. Please check your connection.';
    }
    const data = error.response?.data;
    return data?.exception_err || data?.message || data?.error || data?.detail || error.message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  const fallbacks: Record<string, string> = {
    login: 'Invalid credentials.',
    signup: 'Failed to create account.',
    'profile-update': 'Failed to update profile.',
  };

  return (context && fallbacks[context]) || 'An unexpected error occurred.';
};

export const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError && error.response?.data?.errors) {
    return Object.fromEntries(
      Object.entries(error.response.data.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    );
  }
  return {};
};
