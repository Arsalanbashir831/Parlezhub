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

    // Handle common top-level error fields
    const directError = data?.exception_err || data?.message || data?.error || data?.detail;
    if (directError && typeof directError === 'string') return directError;

    // Handle DRF field-level validation errors: { "field": ["error"], ... }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const messages = Object.entries(data)
        .map(([field, errors]) => {
          // Skip non-error fields if any (usually all are errors in 400 responses)
          if (field === 'status' || field === 'code') return null;
          
          const firstError = Array.isArray(errors) ? errors[0] : errors;
          if (typeof firstError !== 'string') return null;
          
          // Format as "Field: Message" or just "Message" for non_field_errors
          return field === 'non_field_errors' || field === 'detail' 
            ? firstError 
            : `${field.charAt(0).toUpperCase() + field.slice(1)}: ${firstError}`;
        })
        .filter(Boolean);

      if (messages.length > 0) return messages.join(' ');
    }

    return error.message;
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
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    // DRF often puts field errors at the root, but some APIs wrap them in 'errors'
    const errorsSource = data.errors || data;
    
    if (typeof errorsSource === 'object' && !Array.isArray(errorsSource)) {
      return Object.fromEntries(
        Object.entries(errorsSource)
          .filter(([_, v]) => typeof v === 'string' || Array.isArray(v))
          .map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])
      );
    }
  }
  return {};
};
