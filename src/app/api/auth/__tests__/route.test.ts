import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { supabase, cookieStore } = vi.hoisted(() => ({
  supabase: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    refreshSession: vi.fn(),
    signInWithOAuth: vi.fn(),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    resend: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    signInWithIdToken: vi.fn(),
  },
  cookieStore: {
    jar: {} as Record<string, string>,
    get(name: string) {
      const value = cookieStore.jar[name];
      return value === undefined ? undefined : { value };
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: supabase })),
  getValidAccessToken: vi.fn(async () => 'token-1'),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => cookieStore) }));

import { GET, POST } from '@/app/api/auth/[action]/route';

const BACKEND = 'http://backend.test/api';

function post(action: string, body?: unknown) {
  return new NextRequest(`http://app.test/api/auth/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function get(action: string) {
  return new NextRequest(`http://app.test/api/auth/${action}`, { method: 'GET' });
}

const params = (action: string) => ({ params: Promise.resolve({ action }) });

/** Routes Django calls: account sync then the role lookup. */
function stubBackend({
  roles = { has_student: true },
  rolesStatus = 200,
  syncStatus = 200,
  requiresRoleSelection = false,
}: {
  roles?: unknown;
  rolesStatus?: number;
  syncStatus?: number;
  requiresRoleSelection?: boolean;
} = {}) {
  const calls: { url: string; init: Record<string, unknown> }[] = [];
  const fetchMock = vi.fn(async (url: string, init: Record<string, unknown> = {}) => {
    calls.push({ url, init });
    if (url.endsWith('/auth/sync/')) {
      return new Response(JSON.stringify({ requires_role_selection: requiresRoleSelection }), {
        status: syncStatus,
      });
    }
    if (url.endsWith('/me/roles/')) {
      return new Response(JSON.stringify(roles), { status: rolesStatus });
    }
    return new Response('{"detail":"Not found"}', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls };
}

function setCookies(response: Response) {
  return response.headers.getSetCookie();
}

function roleCookieValue(response: Response, name: string) {
  const line = setCookies(response).find((cookie) => cookie.startsWith(`${name}=`));
  if (!line) return undefined;
  return decodeURIComponent(line.split(';')[0].slice(name.length + 1));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  cookieStore.jar = {};
  vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', BACKEND);
  supabase.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.test' } } });
  supabase.signOut.mockResolvedValue({ error: null });
});

describe('POST /api/auth/login', () => {
  it('syncs the account, resolves roles and writes the role cookies', async () => {
    const { calls } = stubBackend();
    supabase.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await POST(post('login', { email: 'a@b.test', password: 'secret' }), params('login'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      isAuthenticated: true,
      userRoles: ['STUDENT'],
      activeRole: 'STUDENT',
    });
    expect(calls.map((call) => call.url)).toEqual([
      `${BACKEND}/auth/sync/`,
      `${BACKEND}/accounts/profiles/me/roles/`,
    ]);
    expect(roleCookieValue(res, 'user_roles')).toBe('["STUDENT"]');
    expect(roleCookieValue(res, 'active_role')).toBe('STUDENT');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('keeps an empty role list distinct from a failed lookup', async () => {
    stubBackend({ roles: {} });
    supabase.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await POST(post('login', { email: 'a@b.test', password: 'secret' }), params('login'));

    expect(roleCookieValue(res, 'user_roles')).toBe('[]');
  });

  it('leaves existing role cookies untouched when the role lookup fails', async () => {
    // A Django outage must not send an already-assigned user to onboarding.
    stubBackend({ rolesStatus: 503 });
    supabase.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await POST(post('login', { email: 'a@b.test', password: 'secret' }), params('login'));

    const body = await res.json();
    expect(body.rolesUnknown).toBe(true);
    expect(body.userRoles).toEqual([]);
    expect(setCookies(res)).toEqual([]);
  });

  it('carries forward the request from Django to pick a role', async () => {
    // The client stops re-checking and shows the picker immediately on this flag.
    stubBackend({ roles: {}, requiresRoleSelection: true });
    supabase.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await POST(
      post('login', { email: 'a@b.test', password: 'secret' }),
      params('login')
    );

    expect(await res.json()).toEqual({
      isAuthenticated: true,
      userRoles: [],
      activeRole: null,
      requiresRoleSelection: true,
    });
    expect(roleCookieValue(res, 'user_roles')).toBe('[]');
  });

  it('clears role cookies when the credential is rejected', async () => {
    stubBackend();
    supabase.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    });

    const res = await POST(
      post('login', { email: 'a@b.test', password: 'wrong' }),
      params('login')
    );

    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Invalid login credentials');
    expect(setCookies(res).every((cookie) => cookie.includes('Max-Age=0'))).toBe(true);
  });

  it('rejects a missing password before contacting Supabase', async () => {
    stubBackend();

    const res = await POST(post('login', { email: 'a@b.test' }), params('login'));

    expect(res.status).toBe(400);
    expect(supabase.signInWithPassword).not.toHaveBeenCalled();
  });

  it('answers a malformed body as a validation error rather than crashing', async () => {
    stubBackend();
    const request = new NextRequest('http://app.test/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });

    const res = await POST(request, params('login'));

    expect(res.status).toBe(400);
  });

  it('reports a server-side crash as JSON and keeps the role cookies', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    }));
    supabase.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token-1' } },
      error: null,
    });

    const res = await POST(post('active-role', { role: 'TEACHER' }), params('active-role'));

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
    expect(setCookies(res)).toEqual([]);
  });
});

describe('GET /api/auth/session', () => {
  it('returns the session from the role cookies without asking Django', async () => {
    cookieStore.jar = {
      user_roles: encodeURIComponent(JSON.stringify(['TEACHER', 'STUDENT', 'BOTH'])),
      active_role: 'TEACHER',
    };
    const { fetchMock } = stubBackend();

    const res = await GET(get('session'), params('session'));

    expect(await res.json()).toEqual({
      isAuthenticated: true,
      userRoles: ['TEACHER', 'STUDENT', 'BOTH'],
      activeRole: 'TEACHER',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls back to Django when the cookies hold no roles', async () => {
    const { calls } = stubBackend({ roles: { has_teacher: true } });

    const res = await GET(get('session'), params('session'));

    expect(await res.json()).toEqual({
      isAuthenticated: true,
      userRoles: ['TEACHER'],
      activeRole: 'TEACHER',
    });
    expect(calls[0].url).toBe(`${BACKEND}/accounts/profiles/me/roles/`);
    expect(roleCookieValue(res, 'user_roles')).toBe('["TEACHER"]');
  });

  it('signs out when Supabase has no user', async () => {
    supabase.getUser.mockResolvedValue({ data: { user: null } });
    stubBackend();

    const res = await GET(get('session'), params('session'));

    expect(await res.json()).toEqual({
      isAuthenticated: false,
      userRoles: [],
      activeRole: null,
    });
    expect(setCookies(res)).toEqual([]);
  });

  it('serves only the session action', async () => {
    stubBackend();

    const res = await GET(get('login'), params('login'));

    expect(res.status).toBe(404);
    expect(supabase.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe('action routing', () => {
  it('maps kebab-case URLs onto camelCase actions', async () => {
    stubBackend({ roles: { has_teacher: true } });

    const res = await POST(post('sync-roles', {}), params('sync-roles'));

    expect(res.status).toBe(200);
    expect((await res.json()).userRoles).toEqual(['TEACHER']);
  });

  it('refuses an unknown action', async () => {
    stubBackend();

    const res = await POST(post('drop-tables', {}), params('drop-tables'));

    expect(res.status).toBe(404);
  });

  it('clears role cookies on logout', async () => {
    stubBackend();

    const res = await POST(post('logout', {}), params('logout'));

    expect(res.status).toBe(200);
    expect(supabase.signOut).toHaveBeenCalled();
    expect(setCookies(res).length).toBe(2);
    expect(setCookies(res).every((cookie) => cookie.includes('Max-Age=0'))).toBe(true);
  });

  it('hands the WebSocket credential without touching role cookies', async () => {
    // wsToken says nothing about roles; clearing them would force onboarding.
    stubBackend();
    cookieStore.jar = {
      user_roles: encodeURIComponent(JSON.stringify(['STUDENT'])),
      active_role: 'STUDENT',
    };

    const res = await POST(post('ws-token', {}), params('ws-token'));

    expect((await res.json()).token).toBe('token-1');
    expect(setCookies(res)).toEqual([]);
  });

  it('writes the chosen role only when Django confirms the account holds it', async () => {
    stubBackend({ roles: { has_student: true } });

    const allowed = await POST(post('active-role', { role: 'STUDENT' }), params('active-role'));
    expect(allowed.status).toBe(200);
    expect(roleCookieValue(allowed, 'active_role')).toBe('STUDENT');

    const denied = await POST(post('active-role', { role: 'TEACHER' }), params('active-role'));
    expect(denied.status).toBe(403);
    expect(setCookies(denied)).toEqual([]);
  });
});

describe('OAuth handoff', () => {
  it('stores the pending redirect next to the Google authorize URL', async () => {
    stubBackend();
    supabase.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.test/auth/v1/authorize?provider=google' },
      error: null,
    });

    const res = await POST(
      post('google-o-auth-start', { redirectTo: '/student/dashboard' }),
      params('google-o-auth-start')
    );

    expect((await res.json()).url).toContain('authorize?provider=google');
    const oauth = setCookies(res).find((cookie) => cookie.startsWith('oauth_redirect='));
    expect(oauth).toBeDefined();
    expect(oauth).toContain('Max-Age=600');
    expect(oauth).toContain('HttpOnly');
  });
});
