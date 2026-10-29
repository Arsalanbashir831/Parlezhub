import { ROUTES } from '@/constants/routes';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Same-origin gateways; each attaches the bearer token server-side, so no
// credential ever reaches this bundle.
const backendInstance = axios.create({ baseURL: '/api/backend' });
const chatInstance = axios.create({ baseURL: '/api/chat' });

// The gateway refreshes an expired session and replays the request itself. A 401
// that comes back here is therefore a genuinely dead session.
function rejectWhenSessionIsDead(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        if (!window.location.pathname.startsWith(ROUTES.AUTH.LOGIN)) {
          toast.error('Session Expired', { description: 'Please sign in again.' });
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
        }
      }

      return Promise.reject(error);
    }
  );
}

rejectWhenSessionIsDead(backendInstance);
rejectWhenSessionIsDead(chatInstance);

export type RequestData =
  | Record<string, string | number | boolean | File | Blob | null | undefined>
  | FormData;

function buildRequest(
  url: string,
  method: AxiosRequestConfig['method'] = 'GET',
  data?: RequestData,
  options: AxiosRequestConfig = {},
  useAuth: boolean = true,
  dataType: 'json' | 'formdata' = 'json',
  signal?: AbortSignal
): AxiosRequestConfig {
  const headers = { ...(options.headers || {}) } as Record<string, string>;

  // Public endpoints: ask the gateway to forward without credentials so a stale
  // session cannot turn an otherwise public read into a 401.
  if (!useAuth) headers['X-Gateway-No-Auth'] = '1';

  // The gateway needs the exact upstream path, trailing slash included, because
  // Next 308s any URL it serves that ends with one. The URL itself stays
  // slash-free so no redirect ever happens.
  const upstreamPath = url.split('?')[0] || '/';
  headers['X-Upstream-Path'] = upstreamPath;

  // Set default Content-Type to JSON only for data-carrying requests
  if (dataType === 'json' && !headers['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    headers['Content-Type'] = 'application/json';
  }

  // Prevent browser caching for GET requests via query parameter
  let finalUrl = upstreamPath.replace(/\/$/, '');
  if (method.toUpperCase() === 'GET') {
    const query = url.slice(upstreamPath.length);
    const separator = query.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${query}${separator}_t=${Date.now()}`;
  } else {
    finalUrl = `${finalUrl}${url.slice(upstreamPath.length)}`;
  }

  const config: AxiosRequestConfig = {
    url: finalUrl,
    method: method.toUpperCase(),
    ...options,
    signal,
    headers,
  };

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

  return config;
}

async function send(
  instance: AxiosInstance,
  config: AxiosRequestConfig,
  onErrorRefresh: boolean
): Promise<AxiosResponse> {
  try {
    return await instance(config);
  } catch (error) {
    if (onErrorRefresh && typeof window !== 'undefined') {
      window.location.reload();
    }
    throw error;
  }
}

const apiCaller = async (
  url: string,
  method: AxiosRequestConfig['method'] = 'GET',
  data?: RequestData,
  options: AxiosRequestConfig = {},
  useAuth: boolean = true,
  dataType: 'json' | 'formdata' = 'json',
  onErrorRefresh: boolean = false,
  signal?: AbortSignal
): Promise<AxiosResponse> =>
  send(
    backendInstance,
    buildRequest(url, method, data, options, useAuth, dataType, signal),
    onErrorRefresh
  );

/** Chat-server calls: same gateway behaviour, different upstream. */
export const chatApiCaller = async (
  url: string,
  method: AxiosRequestConfig['method'] = 'GET',
  data?: RequestData,
  options: AxiosRequestConfig = {},
  useAuth: boolean = true,
  dataType: 'json' | 'formdata' = 'json',
  onErrorRefresh: boolean = false,
  signal?: AbortSignal
): Promise<AxiosResponse> =>
  send(
    chatInstance,
    buildRequest(url, method, data, options, useAuth, dataType, signal),
    onErrorRefresh
  );

export default apiCaller;
