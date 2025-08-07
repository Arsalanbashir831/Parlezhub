import { AxiosError } from 'axios';

// Interface for common API error response structure
interface ApiErrorResponse {
  error?: string;
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

/**
 * Extracts a meaningful error message from various error types
 * @param error - The error object (AxiosError, Error, or any other error)
 * @param fallbackMessage - Fallback message if no meaningful error is found
 * @returns A user-friendly error message
 */
export const extractErrorMessage = (
  error: unknown,
  fallbackMessage: string = 'An error occurred'
): string => {
  // Handle Axios errors (API responses)
  if (error instanceof AxiosError && error.response?.data) {
    const responseData = error.response.data as ApiErrorResponse;

    // Try different possible error message fields
    const errorMessage =
      responseData.error ||
      responseData.message ||
      responseData.detail ||
      error.message;

    if (errorMessage) {
      return errorMessage;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  // Fallback
  return fallbackMessage;
};

/**
 * Extracts field-specific validation errors from API responses
 * @param error - The error object (usually AxiosError)
 * @returns Object with field names as keys and error messages as values
 */
export const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError && error.response?.data) {
    const responseData = error.response.data as ApiErrorResponse;

    if (responseData.errors && typeof responseData.errors === 'object') {
      const fieldErrors: Record<string, string> = {};

      Object.entries(responseData.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[field] = messages[0]; // Take the first error message for each field
        }
      });

      return fieldErrors;
    }
  }

  return {};
};

/**
 * Checks if an error is a network error (no internet connection, etc.)
 * @param error - The error object
 * @returns True if it's a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && error.request;
  }
  return false;
};

/**
 * Checks if an error is an authentication error (401, 403)
 * @param error - The error object
 * @returns True if it's an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
};

/**
 * Gets a user-friendly error message based on error type
 * @param error - The error object
 * @param context - Context for the operation (e.g., 'login', 'signup', 'profile-update')
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: unknown, context?: string): string => {
  // Handle network errors
  if (isNetworkError(error)) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Handle authentication errors
  if (isAuthError(error)) {
    return 'Authentication failed. Please sign in again.';
  }

  // Extract specific error message from API response
  const extractedMessage = extractErrorMessage(error);

  // If we got a meaningful message from the API, use it
  if (extractedMessage && extractedMessage !== 'An error occurred') {
    return extractedMessage;
  }

  // Provide context-specific fallback messages
  const fallbackMessages: Record<string, string> = {
    login: 'Invalid email or password. Please try again.',
    signup:
      'Failed to create account. Please check your information and try again.',
    'forgot-password':
      'Failed to send reset email. Please check your email address.',
    'reset-password': 'Failed to reset password. Please try again.',
    'profile-update': 'Failed to update profile. Please try again.',
    'fetch-profile': 'Failed to load profile. Please try again.',
    'profile-picture': 'Failed to upload profile picture. Please try again.',
    'service-creation': 'Failed to create service. Please try again.',
    'service-update': 'Failed to update service. Please try again.',
    'service-deletion': 'Failed to delete service. Please try again.',
    'service-status-update':
      'Failed to update service status. Please try again.',
    'fetch-services': 'Failed to load services. Please try again.',
    'fetch-public-services': 'Failed to load teachers. Please try again.',
  };

  return context
    ? fallbackMessages[context] || 'An error occurred'
    : 'An error occurred';
};
