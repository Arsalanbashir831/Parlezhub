import { beforeEach, describe, expect, it, vi } from 'vitest';

const { instances, toast } = vi.hoisted(() => ({
  instances: [] as { baseURL: string; calls: Record<string, unknown>[] }[],
  toast: { error: vi.fn() },
}));

interface MockError {
  response?: { status?: number };
}

interface MockInstance {
  (config: Record<string, unknown>): Promise<unknown>;
  baseURL: string;
  calls: Record<string, unknown>[];
  failWith: (error: Error) => void;
  interceptorErrorHandler: ((error: MockError) => Promise<unknown>) | undefined;
  interceptors: {
    response: {
      use: (
        ok: unknown,
        err: (error: MockError) => Promise<unknown>
      ) => void;
    };
  };
}

vi.mock('axios', () => {
  const makeInstance = (baseURL: string): MockInstance => {
    const calls: Record<string, unknown>[] = [];
    let failure: Error | undefined;

    const instance = (async (config: Record<string, unknown>) => {
      calls.push(config);
      if (failure) throw failure;
      return { status: 200, data: {}, config };
    }) as MockInstance;

    instance.baseURL = baseURL;
    instance.calls = calls;
    instance.failWith = (error: Error) => {
      failure = error;
    };
    instance.interceptorErrorHandler = undefined;
    instance.interceptors = {
      response: {
        use: (_ok, err) => {
          instance.interceptorErrorHandler = err;
        },
      },
    };
    instances.push(instance as (typeof instances)[number]);
    return instance;
  };

  return {
    default: {
      create: (config: { baseURL?: string }) =>
        makeInstance(config?.baseURL ?? ''),
    },
  };
});

vi.mock('sonner', () => ({ toast }));

import apiCaller, { chatApiCaller, type RequestData } from '@/lib/api-caller';

function instance(baseURL: string) {
  return instances.find((entry) => entry.baseURL === baseURL) as MockInstance;
}

function lastCall(baseURL = '/api/backend') {
  const entry = instance(baseURL);
  return entry.calls[entry.calls.length - 1];
}

function headers(baseURL?: string) {
  return lastCall(baseURL).headers as Record<string, string>;
}

function stubWindow(pathname: string, search = '') {
  const location = { pathname, search, href: '', reload: vi.fn() };
  vi.stubGlobal('window', { location });
  return location;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  toast.error.mockReset();
  instance('/api/backend').calls.length = 0;
  instance('/api/chat').calls.length = 0;
});

describe('gateway request contract', () => {
  it('routes backend and chat calls to their own same-origin gateway', async () => {
    await apiCaller('/accounts/gigs/');
    await chatApiCaller('/chat/rooms/');

    expect(instance('/api/backend')).toBeDefined();
    expect(instance('/api/chat')).toBeDefined();
    expect(headers()['X-Upstream-Path']).toBe('/accounts/gigs/');
    expect(headers('/api/chat')['X-Upstream-Path']).toBe('/chat/rooms/');
  });

  it('keeps the trailing slash in the header while the URL stays slashless', async () => {
    // Next 308s any URL it serves that ends with `/`, and Django answers a
    // slashless POST with 500 — so the exact path travels in X-Upstream-Path.
    await apiCaller('/auth/set-role/', 'POST', { role: 'STUDENT' });

    expect(headers()['X-Upstream-Path']).toBe('/auth/set-role/');
    expect(lastCall().url).toBe('/auth/set-role');
    expect(lastCall().method).toBe('POST');
  });

  it('defaults a data-carrying request to JSON', async () => {
    await apiCaller('/auth/sync/', 'POST', { client: 'web' });

    expect(headers()['Content-Type']).toBe('application/json');
    expect(lastCall().data).toEqual({ client: 'web' });
  });

  it('adds no JSON content type to a GET', async () => {
    await apiCaller('/accounts/gigs/');

    expect(headers()['Content-Type']).toBeUndefined();
  });

  it('respects an explicit content type', async () => {
    await apiCaller('/media/upload/', 'POST', { a: 1 }, {
      headers: { 'Content-Type': 'text/plain' },
    });

    expect(headers()['Content-Type']).toBe('text/plain');
  });

  it('never sends an empty upstream path', async () => {
    await apiCaller('', 'POST', { a: 1 });

    expect(headers()['X-Upstream-Path']).toBe('/');
  });

  it('preserves caller options alongside the generated config', async () => {
    await apiCaller('/reports/pdf/', 'GET', undefined, { timeout: 60000, responseType: 'arraybuffer' });

    expect(lastCall().timeout).toBe(60000);
    expect(lastCall().responseType).toBe('arraybuffer');
  });
});

describe('GET cache busting', () => {
  it('appends a cache buster to a bare GET', async () => {
    await apiCaller('/notifications/');

    expect(String(lastCall().url)).toMatch(/^\/notifications\?_t=\d+$/);
  });

  it('keeps an existing query and joins the cache buster with &', async () => {
    await apiCaller('/student/bookings/?status=active&page=2');

    expect(String(lastCall().url)).toMatch(
      /^\/student\/bookings\?status=active&page=2&_t=\d+$/
    );
  });

  it('leaves a non-GET query untouched', async () => {
    await apiCaller('/search/?q=jupiter', 'POST', { q: 'jupiter' });

    expect(lastCall().url).toBe('/search?q=jupiter');
  });
});

describe('public endpoints', () => {
  it('asks the gateway to skip credentials when useAuth is false', async () => {
    await apiCaller('/blogs/public/', 'GET', undefined, {}, false);

    expect(headers()['X-Gateway-No-Auth']).toBe('1');
  });

  it('omits the no-auth header by default', async () => {
    await apiCaller('/blogs/public/');

    expect(headers()['X-Gateway-No-Auth']).toBeUndefined();
  });
});

describe('uploads', () => {
  it('builds FormData from a plain object and skips empty fields', async () => {
    const file = new File(['abc'], 'p.jpg', { type: 'image/jpeg' });
    const data: RequestData = { file, caption: 'test', count: 3, blank: null };

    await apiCaller('/media/upload/', 'POST', data, {}, true, 'formdata');

    const form = lastCall().data as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get('caption')).toBe('test');
    expect(form.get('count')).toBe('3');
    expect((form.get('file') as File).name).toBe('p.jpg');
    expect(form.has('blank')).toBe(false);
  });

  it('passes an existing FormData through unchanged', async () => {
    const form = new FormData();
    form.append('slug', 'raw');

    await apiCaller('/media/upload/', 'POST', form, {}, true, 'formdata');

    expect(lastCall().data).toBe(form);
  });

  it('forwards an abort signal', async () => {
    const controller = new AbortController();

    await apiCaller(
      '/notifications/',
      'GET',
      undefined,
      {},
      true,
      'json',
      false,
      controller.signal
    );

    expect(lastCall().signal).toBe(controller.signal);
  });
});

describe('dead-session handling', () => {
  it('sends a 401 to sign-in with the current path preserved', async () => {
    const location = stubWindow('/student/bookings', '?tab=upcoming');
    await apiCaller('/bookings/');

    const handler = instance('/api/backend').interceptorErrorHandler!;
    const error: MockError = { response: { status: 401 } };

    await expect(handler(error)).rejects.toBe(error);
    expect(toast.error).toHaveBeenCalledWith('Session Expired', {
      description: 'Please sign in again.',
    });
    expect(location.href).toBe(
      `/auth/sign-in?redirect=${encodeURIComponent('/student/bookings?tab=upcoming')}`
    );
  });

  it('does not redirect when the user is already on sign-in', async () => {
    const location = stubWindow('/auth/sign-in');
    await apiCaller('/auth/login/');

    const handler = instance('/api/backend').interceptorErrorHandler!;

    await expect(handler({ response: { status: 401 } })).rejects.toBeDefined();
    expect(toast.error).not.toHaveBeenCalled();
    expect(location.href).toBe('');
  });

  it('leaves a 500 alone — session refresh belongs to the gateway', async () => {
    const location = stubWindow('/student/dashboard');
    await apiCaller('/bookings/');

    const handler = instance('/api/backend').interceptorErrorHandler!;
    const error: MockError = { response: { status: 500 } };

    await expect(handler(error)).rejects.toBe(error);
    expect(toast.error).not.toHaveBeenCalled();
    expect(location.href).toBe('');
  });

  it('stays quiet during server rendering', async () => {
    await apiCaller('/bookings/');

    const handler = instance('/api/backend').interceptorErrorHandler!;
    const error: MockError = { response: { status: 401 } };

    await expect(handler(error)).rejects.toBe(error);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('chat calls share the same dead-session behaviour', async () => {
    const location = stubWindow('/student/chat');
    await chatApiCaller('/chat/rooms/');

    const handler = instance('/api/chat').interceptorErrorHandler!;
    await expect(handler({ response: { status: 401 } })).rejects.toBeDefined();

    expect(location.href).toBe('/auth/sign-in?redirect=%2Fstudent%2Fchat');
  });

  it('reloads when the caller opted into refresh-on-error', async () => {
    const location = stubWindow('/student/dashboard');
    instance('/api/backend').failWith(new Error('network'));

    await expect(
      apiCaller('/bookings/', 'GET', undefined, {}, true, 'json', true)
    ).rejects.toThrow('network');

    expect(location.reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload for an opt-out caller', async () => {
    const location = stubWindow('/student/dashboard');
    instance('/api/backend').failWith(new Error('network'));

    await expect(apiCaller('/bookings/')).rejects.toThrow('network');
    expect(location.reload).not.toHaveBeenCalled();
  });
});
