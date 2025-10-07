import { API_ROUTES } from '@/constants/api-routes';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

import { getCookie, removeCookie, setCookie } from '@/lib/cookie-utils';

type RequestData =
  | Record<string, string | number | boolean | File | Blob>
  | FormData;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token as unknown as AxiosResponse);
    }
  });

  failedQueue = [];
};

const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = getCookie('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.REFRESH_TOKEN}`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    setCookie('access_token', access_token);
    setCookie('refresh_token', refresh_token);
    return access_token;
  } catch (error) {
    // If refresh fails, clear all tokens and redirect to login
    removeCookie('access_token');
    removeCookie('refresh_token');
    removeCookie('user_role');

    // Show error toast
    toast.error('Session Expired', {
      description: 'Your session has expired. Please sign in again.',
    });

    throw error;
  }
};

const apiCaller = async (
  url: string,
  method: AxiosRequestConfig['method'] = 'GET',
  data?: RequestData,
  options: AxiosRequestConfig = {},
  useAuth: boolean = true,
  dataType: 'json' | 'formdata' = 'json',
  onErrorRefresh: boolean = false,
  signal?: AbortSignal
): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    ...options,
    method,
    headers: {
      ...(options.headers || {}),
    },
    signal,
  };
  config.headers = {};
  if (useAuth) {
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (data) {
    if (dataType === 'json') {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    } else if (dataType === 'formdata') {
      // If data is already FormData, use it directly
      if (data instanceof FormData) {
        config.data = data;
      } else {
        // Otherwise, convert object to FormData
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        });
        config.data = formData;
      }
      delete config.headers['Content-Type'];
    }
  }

  try {
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
    const response = await axios(fullUrl, config);
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle 401 Unauthorized or 403 Forbidden (token expired)
      if (
        (error.response?.status === 403 || error.response?.status === 401) &&
        useAuth
      ) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        }

        isRefreshing = true;

        try {
          const newToken = await refreshToken();

          // Update the original request with new token
          const retryConfig: AxiosRequestConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };

          // Retry the original request
          const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
          const response = await axios(fullUrl, retryConfig);

          // Process any queued requests
          processQueue(null, newToken);

          return response;
        } catch (refreshError) {
          // If refresh fails, process queue with error
          processQueue(refreshError, null);

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/sign-in';
          }

          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      if (onErrorRefresh) {
        window.location.reload();
      }
      throw error;
    } else {
      throw { message: 'Network error or unknown error occurred' };
    }
  }
};

export default apiCaller;
