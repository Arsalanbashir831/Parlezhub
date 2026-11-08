import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { exchangeCodeForSession } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { exchangeCodeForSession } })),
}));

import { handleAuthCallback } from '@/lib/auth-callback';
import { publicOrigin } from '@/lib/request-origin';

/** A request as the production container sees it: bound to 0.0.0.0:3000,
 *  with the public host only in the proxy's forwarded header. */
function containerRequest(path: string, forwardedHost?: string) {
  return new NextRequest(`http://0.0.0.0:3000${path}`, {
    headers: forwardedHost ? { 'x-forwarded-host': forwardedHost } : undefined,
  });
}

const location = (res: Response) => res.headers.get('location');

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://backend.test/api');
  // Django sync and role lookup: answered, no roles to write.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }))
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('publicOrigin', () => {
  it('uses the forwarded host over https in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(publicOrigin(containerRequest('/', 'app.example.com'))).toBe('https://app.example.com');
    expect(publicOrigin(containerRequest('/', 'app.example.com, proxy.internal'))).toBe(
      'https://app.example.com'
    );
  });

  it('uses the request origin in development, or with no proxy in front', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(publicOrigin(containerRequest('/', 'app.example.com'))).toBe('http://0.0.0.0:3000');
    vi.stubEnv('NODE_ENV', 'production');
    expect(publicOrigin(containerRequest('/'))).toBe('http://0.0.0.0:3000');
  });
});

describe('handleAuthCallback behind the production proxy', () => {
  beforeEach(() => vi.stubEnv('NODE_ENV', 'production'));

  it('sends a link without a code to the public error page, not the container address', async () => {
    const res = await handleAuthCallback(
      containerRequest('/astrology/auth/callback', 'app.example.com'),
      'astrology'
    );

    expect(location(res)).toBe('https://app.example.com/astrology/auth/auth-code-error');
  });

  it('sends a failed code exchange to the public error page of the same app', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'invalid flow state, no valid flow state found' },
    });

    const res = await handleAuthCallback(
      containerRequest('/parlezhub/auth/callback?code=stale', 'app.example.com'),
      'parlezhub'
    );

    expect(location(res)).toBe('https://app.example.com/parlezhub/auth/auth-code-error');
  });

  it('lands a successful sign-in on the public home of the app', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await handleAuthCallback(
      containerRequest('/parlezhub/auth/callback?code=ok', 'app.example.com'),
      'parlezhub'
    );

    expect(location(res)).toBe('https://app.example.com/parlezhub');
  });

  it('sends a recovery link to the app’s public reset page', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await handleAuthCallback(
      containerRequest('/astrology/auth/callback?code=ok&type=recovery', 'app.example.com'),
      'astrology'
    );

    expect(location(res)).toBe('https://app.example.com/astrology/auth/reset-password');
  });
});

describe('handleAuthCallback in local development', () => {
  it('keeps the request’s own origin', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const res = await handleAuthCallback(
      new NextRequest('http://localhost:3000/astrology/auth/callback'),
      'astrology'
    );

    expect(location(res)).toBe('http://localhost:3000/astrology/auth/auth-code-error');
  });
});

describe('handleAuthCallback keeps a sign-in inside its own app', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });
  });

  const withCookies = (path: string, cookies: Record<string, string>) =>
    new NextRequest(`http://localhost:3000${path}`, {
      headers: {
        cookie: Object.entries(cookies)
          .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
          .join('; '),
      },
    });

  it('ignores a destination left behind by a Shakti Wheel sign-in', async () => {
    const res = await handleAuthCallback(
      withCookies('/parlezhub/auth/callback?code=ok', { oauth_redirect: '/astrology/dasha' }),
      'parlezhub'
    );

    expect(location(res)).toBe('http://localhost:3000/parlezhub');
  });

  it('honours a destination inside the same app', async () => {
    const res = await handleAuthCallback(
      withCookies('/parlezhub/auth/callback?code=ok', { oauth_redirect: '/parlezhub/practice?lang=fr' }),
      'parlezhub'
    );

    expect(location(res)).toBe('http://localhost:3000/parlezhub/practice?lang=fr');
  });

  it('never treats "/" or a look-alike prefix as this app', async () => {
    for (const next of ['/', '/parlezhubby', '//evil.example/parlezhub']) {
      const res = await handleAuthCallback(
        withCookies('/parlezhub/auth/callback?code=ok', { oauth_redirect: next }),
        'parlezhub'
      );
      expect(location(res)).toBe('http://localhost:3000/parlezhub');
    }
  });

  it('clears the handoff cookies whatever the outcome', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { session: null }, error: { message: 'stale' } });

    const res = await handleAuthCallback(
      withCookies('/parlezhub/auth/callback?code=stale', {
        oauth_redirect: '/parlezhub',
        auth_app: 'parlezhub',
      }),
      'parlezhub'
    );

    const cleared = res.headers.getSetCookie().join('\n');
    expect(cleared).toMatch(/oauth_redirect=;/);
    expect(cleared).toMatch(/auth_app=;/);
  });
});
