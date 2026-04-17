import { API_ROUTES } from '@/constants/api-routes';
import { ROUTES } from '@/constants/routes';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { clearAuthCookies, getCookie, setCookie } from '@/lib/cookie-utils';

// Singleton instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie('access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized or 403 Forbidden
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getCookie('refresh_token');

      if (!refreshTokenValue) {
        isRefreshing = false;
        clearAuthCookies();
        if (typeof window !== 'undefined') {
          if (!window.location.pathname.startsWith(ROUTES.AUTH.LOGIN)) {
            window.location.href = ROUTES.AUTH.LOGIN;
          }
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.REFRESH_TOKEN}`,
          { refresh_token: refreshTokenValue }
        );

        const { access_token, refresh_token } = response.data;

        if (access_token) setCookie('access_token', access_token);
        if (refresh_token) setCookie('refresh_token', refresh_token);

        const tokenToUse = access_token;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokenToUse}`;
        originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;

        processQueue(null, tokenToUse);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthCookies();
        if (typeof window !== 'undefined') {
          if (!window.location.pathname.startsWith(ROUTES.AUTH.LOGIN)) {
            toast.error('Session Expired', {
              description: 'Please sign in again.',
            });
            window.location.href = ROUTES.AUTH.LOGIN;
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
  const config: AxiosRequestConfig = {
    url,
    method,
    ...options,
    signal,
    headers: {
      ...(options.headers || {}),
    },
  };

  if (!useAuth) {
    if (config.headers) {
      delete config.headers.Authorization;
    }
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
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
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
