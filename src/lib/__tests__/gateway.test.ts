import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getValidAccessToken, refreshSession, upstreamFetch } = vi.hoisted(() => ({
  getValidAccessToken: vi.fn(),
  refreshSession: vi.fn(),
  upstreamFetch: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { refreshSession } })),
  getValidAccessToken,
}));

import { forwardToUpstream } from '@/lib/gateway';

const BACKEND = 'http://backend.test/api';

function gatewayRequest(
  input: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit | null;
  } = {}
) {
  const {
    url = 'http://app.test/api/backend/auth/set-role',
    method = 'POST',
    headers = {},
    body = '{"role":"STUDENT"}',
  } = input;

  return new NextRequest(url, {
    method,
    headers: { ...headers, cookie: 'session=abc' },
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
  });
}

/** Upstream reply; the gateway only reads headers and streams the body. */
function upstreamReply(
  status = 200,
  init: { headers?: Record<string, string>; body?: BodyInit | null } = {}
) {
  const body = status === 204 ? null : (init.body ?? '{"ok":true}');
  upstreamFetch.mockResolvedValue(new Response(body, { status, headers: init.headers }));
}

function upstreamCall(index = 0) {
  return upstreamFetch.mock.calls[index];
}

describe('gateway upstream path resolution', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', BACKEND);
    vi.stubEnv('NEXT_PUBLIC_CHAT_SERVER_URL', 'http://chat.test');
    vi.unstubAllGlobals();
    vi.stubGlobal('fetch', upstreamFetch);
    getValidAccessToken.mockResolvedValue('token-1');
    upstreamReply();
  });

  it('keeps Django trailing slashes sent through X-Upstream-Path', async () => {
    // Regression: Next 308s `/api/backend/auth/set-role/` to the slashless form,
    // and a slashless POST makes Django answer 500.
    await forwardToUpstream(
      gatewayRequest({ headers: { 'x-upstream-path': '/auth/set-role/' } }),
      'backend',
      ['auth', 'set-role']
    );

    expect(upstreamCall()[0]).toBe(`${BACKEND}/auth/set-role/`);
  });

  it('falls back to the route segments when the header is missing', async () => {
    await forwardToUpstream(gatewayRequest(), 'backend', ['auth', 'set-role', '']);

    expect(upstreamCall()[0]).toBe(`${BACKEND}/auth/set-role/`);
  });

  it.each([
    ['a query', 'auth/set-role/?next=/x'],
    ['no leading slash', 'auth/set-role/'],
    ['a fragment', '/auth/set-role/#frag'],
    ['a backslash', '/auth\\..\\etc'],
    ['whitespace', '/auth/set role/'],
    ['dot-dot traversal', '/../../etc/passwd'],
    ['single-dot traversal', '/auth/./set-role/'],
  ])('ignores an upstream path carrying %s', async (_label, value) => {
    await forwardToUpstream(
      gatewayRequest({ headers: { 'x-upstream-path': value } }),
      'backend',
      ['auth', 'set-role']
    );

    expect(upstreamCall()[0]).toBe(`${BACKEND}/auth/set-role`);
  });

  it('appends the incoming query string', async () => {
    await forwardToUpstream(
      gatewayRequest({
        url: 'http://app.test/api/backend/notifications?page=2',
        method: 'GET',
        headers: { 'x-upstream-path': '/notifications/' },
      }),
      'backend',
      ['notifications']
    );

    expect(upstreamCall()[0]).toBe(`${BACKEND}/notifications/?page=2`);
  });

  it('refuses to proxy for an unconfigured upstream', async () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', '');

    const res = await forwardToUpstream(gatewayRequest(), 'backend', ['auth']);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'backend upstream is not configured' });
    expect(upstreamFetch).not.toHaveBeenCalled();
  });
});

describe('gateway credential handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', BACKEND);
    vi.stubEnv('NEXT_PUBLIC_CHAT_SERVER_URL', 'http://chat.test');
    vi.unstubAllGlobals();
    vi.stubGlobal('fetch', upstreamFetch);
    getValidAccessToken.mockResolvedValue('token-1');
    refreshSession.mockResolvedValue({ data: { session: null }, error: null });
    upstreamReply();
  });

  it('attaches the server-side bearer token and forwards body and method', async () => {
    const request = gatewayRequest({
      headers: { 'content-type': 'application/json' },
      body: '{"role":"STUDENT"}',
    });

    await forwardToUpstream(request, 'backend', ['auth', 'set-role']);

    const [url, init] = upstreamCall();
    expect(init.method).toBe('POST');
    expect(init.headers.get('Authorization')).toBe('Bearer token-1');
    expect(init.headers.get('Content-Type')).toBe('application/json');
    expect(await new Response(init.body).text()).toBe('{"role":"STUDENT"}');
    expect(url).toBe(`${BACKEND}/auth/set-role`);
  });

  it('mirrors an upload content type so FormData boundaries survive', async () => {
    const form = new FormData();
    form.append('file', new Blob(['x']), 'p.jpg');

    await forwardToUpstream(
      gatewayRequest({ body: form as unknown as BodyInit }),
      'backend',
      ['media', 'upload']
    );

    const [, init] = upstreamCall();
    expect(init.headers.get('Content-Type')).toMatch(/^multipart\/form-data; ?boundary=/);
    expect(init.headers.get('Authorization')).toBe('Bearer token-1');
  });

  it('forwards public calls without touching the session', async () => {
    await forwardToUpstream(
      gatewayRequest({ headers: { 'x-gateway-no-auth': '1' } }),
      'backend',
      ['blogs']
    );

    expect(getValidAccessToken).not.toHaveBeenCalled();
    expect(upstreamCall()[1].headers.get('Authorization')).toBeNull();
  });

  it('does not treat a public 401 as a dead session', async () => {
    upstreamReply(401);

    const res = await forwardToUpstream(
      gatewayRequest({ headers: { 'x-gateway-no-auth': '1' } }),
      'backend',
      ['blogs']
    );

    expect(refreshSession).not.toHaveBeenCalled();
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('refreshes and replays once when the token was rejected', async () => {
    upstreamFetch
      .mockResolvedValueOnce(new Response('{"detail":"token not valid"}', { status: 401 }))
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    refreshSession.mockResolvedValue({ data: { session: { access_token: 'token-2' } } });

    const res = await forwardToUpstream(gatewayRequest(), 'backend', ['auth', 'set-role']);

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(upstreamFetch).toHaveBeenCalledTimes(2);
    expect(upstreamCall(0)[1].headers.get('Authorization')).toBe('Bearer token-1');
    expect(upstreamCall(1)[1].headers.get('Authorization')).toBe('Bearer token-2');
    expect(res.status).toBe(200);
  });

  it('skips the replay when the refresh yields the same token', async () => {
    upstreamReply(401);
    refreshSession.mockResolvedValue({ data: { session: { access_token: 'token-1' } } });

    const res = await forwardToUpstream(gatewayRequest(), 'backend', ['auth', 'set-role']);

    expect(upstreamFetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
  });

  it('skips the replay when the refresh fails', async () => {
    upstreamReply(401);
    refreshSession.mockResolvedValue({ error: new Error('refresh_failed'), data: {} });

    await forwardToUpstream(gatewayRequest(), 'backend', ['auth', 'set-role']);

    expect(upstreamFetch).toHaveBeenCalledTimes(1);
  });

  it('skips the replay when the refresh throws', async () => {
    upstreamReply(401);
    refreshSession.mockRejectedValue(new Error('network down'));

    const res = await forwardToUpstream(gatewayRequest(), 'backend', ['auth', 'set-role']);

    // A Supabase outage must not turn a proxied 401 into a gateway 500.
    expect(upstreamFetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
  });

  it('clears the role cookies on a final 401 so middleware sees a signed-out user', async () => {
    upstreamReply(401);
    refreshSession.mockResolvedValue({ error: new Error('session_missing'), data: null });

    const res = await forwardToUpstream(gatewayRequest(), 'backend', ['auth', 'set-role']);

    const jar = res.headers.getSetCookie();
    expect(jar.some((c) => c.startsWith('user_roles=') && c.includes('Max-Age=0'))).toBe(true);
    expect(jar.some((c) => c.startsWith('active_role=') && c.includes('Max-Age=0'))).toBe(true);
  });
});

describe('gateway response handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', BACKEND);
    vi.stubEnv('NEXT_PUBLIC_CHAT_SERVER_URL', 'http://chat.test');
    vi.unstubAllGlobals();
    vi.stubGlobal('fetch', upstreamFetch);
    getValidAccessToken.mockResolvedValue('token-1');
    upstreamReply();
  });

  it('mirrors payload headers and marks the reply uncacheable', async () => {
    upstreamReply(200, {
      body: 'report-bytes',
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="report.pdf"',
        'content-encoding': 'gzip',
      },
    });

    const res = await forwardToUpstream(
      gatewayRequest({ method: 'GET' }),
      'backend',
      ['reports']
    );

    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toBe('attachment; filename="report.pdf"');
    expect(res.headers.get('cache-control')).toBe('no-store');
    // Hop-by-hop headers describe the upstream connection, not ours.
    expect(res.headers.get('content-encoding')).toBeNull();
  });

  it('re-points same-origin upstream redirects at the gateway', async () => {
    upstreamReply(302, { headers: { location: `${BACKEND}/payments/done/` } });

    const res = await forwardToUpstream(
      gatewayRequest({ method: 'GET', url: 'http://app.test/api/backend/payments/start' }),
      'backend',
      ['payments', 'start']
    );

    expect(res.headers.get('location')).toBe('/api/backend/payments/done/');
  });

  it('keeps the query of a redirected upstream URL', async () => {
    upstreamReply(301, { headers: { location: `${BACKEND}/accounts/profile/?next=%2Fstudent%2Fdashboard` } });

    const res = await forwardToUpstream(gatewayRequest({ method: 'GET' }), 'backend', ['accounts']);

    expect(res.headers.get('location')).toBe('/api/backend/accounts/profile/?next=%2Fstudent%2Fdashboard');
  });

  it('rewrites an origin-relative redirect location onto the gateway', async () => {
    upstreamReply(302, { headers: { location: '/api/auth/login/' } });

    const res = await forwardToUpstream(gatewayRequest({ method: 'GET' }), 'backend', ['auth']);

    expect(res.headers.get('location')).toBe('/api/backend/auth/login/');
  });

  it('leaves a redirect to another host alone', async () => {
    upstreamReply(302, { headers: { location: 'https://checkout.stripe.test/c/pay_123' } });

    const res = await forwardToUpstream(gatewayRequest({ method: 'GET' }), 'backend', ['payments']);

    expect(res.headers.get('location')).toBe('https://checkout.stripe.test/c/pay_123');
  });

  it('neutralises a protocol-relative redirect that points off the upstream', async () => {
    // Sent through our origin, `//host` would be an open redirect.
    upstreamReply(302, { headers: { location: '//evil.test/grab-cookie' } });

    const res = await forwardToUpstream(gatewayRequest({ method: 'GET' }), 'backend', ['auth']);

    expect(res.headers.get('location')).toBe('/');
  });

  it('does not rewrite a 200 that happens to carry a location header', async () => {
    upstreamReply(200, { headers: { location: `${BACKEND}/elsewhere/` } });

    const res = await forwardToUpstream(gatewayRequest({ method: 'GET' }), 'backend', ['auth']);

    expect(res.headers.get('location')).toBe(`${BACKEND}/elsewhere/`);
  });

  it('answers HEAD and 204 with an empty body but the upstream status', async () => {
    upstreamReply(204, { body: '' });

    const res = await forwardToUpstream(
      gatewayRequest({ method: 'HEAD' }),
      'backend',
      ['health']
    );

    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('passes the upstream status through untouched', async () => {
    upstreamReply(404, { body: '{"detail":"Not found."}' });

    const res = await forwardToUpstream(gatewayRequest(), 'backend', ['accounts', 'gigs']);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ detail: 'Not found.' });
  });
});
