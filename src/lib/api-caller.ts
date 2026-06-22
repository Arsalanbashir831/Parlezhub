import { ROUTES } from '@/constants/routes';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { clearAuthCookies } from '@/lib/cookie-utils';
import { tokenStore } from '@/lib/token-store';

// Singleton instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.headers.Authorization) {
      // Use the in-memory token cache first.
      // Calling supabase.auth.getSession() on every request blocks on the Web Locks API
      // whenever Supabase's background token-refresh timer is running (~every 30s), which
      // causes all concurrent API calls to freeze for up to 5 seconds. The cache is kept
      // fresh by onAuthStateChange in auth-context.tsx so this is always the current token.
      const cached = tokenStore.get();
      if (cached) {
        config.headers.Authorization = `Bearer ${cached}`;
      } else {
        // Cache miss: fall back to getSession (first page load or just after token expiry)
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
            tokenStore.set(session.access_token, session.expires_at ?? Math.floor(Date.now() / 1000) + 3600);
          }
        } catch (err) {
          console.warn('Failed to get Supabase session for API request:', err);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If we already retried and it still failed, the session is truly dead
      if (originalRequest._retry) {
        tokenStore.clear();
        clearAuthCookies();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith(ROUTES.AUTH.LOGIN)) {
          toast.error('Session Expired', { description: 'Please sign in again.' });
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Force a session refresh — clear the stale cached token first
        tokenStore.clear();
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !data.session) {
          throw refreshError || new Error('No session returned');
        }

        const tokenToUse = data.session.access_token;
        tokenStore.set(tokenToUse, data.session.expires_at ?? Math.floor(Date.now() / 1000) + 3600);
        originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        tokenStore.clear();
        clearAuthCookies();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith(ROUTES.AUTH.LOGIN)) {
          toast.error('Session Expired', { description: 'Please sign in again.' });
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export type RequestData =
  | Record<string, string | number | boolean | File | Blob | null | undefined>
  | FormData;

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
  const headers = { ...(options.headers || {}) } as Record<string, string>;

  // Set default Content-Type to JSON only for data-carrying requests
  if (dataType === 'json' && !headers['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    headers['Content-Type'] = 'application/json';
  }

  // Prevent browser caching for GET requests via query parameter
  let finalUrl = url;
  if (method.toUpperCase() === 'GET') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}_t=${Date.now()}`;
  }

  const config: AxiosRequestConfig = {
    url: finalUrl,
    method: method.toUpperCase(),
    ...options,
    signal,
    headers,
  };

  if (useAuth === false && config.headers) {
    delete (config.headers as Record<string, string>).Authorization;
  }

  if (data) {
    if (dataType === 'formdata') {
      const formData = data instanceof FormData ? data : new FormData();
      if (!(data instanceof FormData)) {
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
      }
      config.data = formData;
    } else {
      config.data = data;
    }
  }

  try {
    return await axiosInstance(config);
  } catch (error) {
    if (onErrorRefresh && typeof window !== 'undefined') {
      window.location.reload();
    }
    throw error;
  }
};

export default apiCaller;
