import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser } })),
}));

import { config, proxy } from '@/proxy';

function request(path = '/student/dashboard', cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

  return new NextRequest(`http://app.test${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

const ROLES = (roles: string[]) => ({
  user_roles: encodeURIComponent(JSON.stringify(roles)),
});

function signedIn(user: unknown = { id: 'u1' }) {
  getUser.mockResolvedValue({ data: { user } });
}

function signedOut() {
  getUser.mockResolvedValue({ data: { user: null } });
}

beforeEach(() => {
  vi.resetAllMocks();
  signedIn();
});

describe('sign-in link interception', () => {
  it('moves an auth code from the root onto the callback route', async () => {
    const res = await proxy(request('/?code=abc123&state=xy'));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/auth/callback');
    expect(location.searchParams.get('code')).toBe('abc123');
    expect(location.searchParams.get('state')).toBe('xy');
  });

  it('moves a password-recovery link onto the reset route', async () => {
    const res = await proxy(request('/?type=recovery'));

    expect(new URL(res.headers.get('location')!).pathname).toBe('/auth/reset-password');
  });
});

describe('unauthenticated visitors', () => {
  it('sends a protected route to sign-in with the intended path preserved', async () => {
    signedOut();

    const res = await proxy(request('/student/bookings'));

    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/auth/sign-in');
    expect(location.searchParams.get('redirect')).toBe('/student/bookings');
  });

  it('leaves public routes alone', async () => {
    signedOut();

    for (const path of ['/auth/sign-in', '/auth/signup', '/terms', '/ai-session/setup']) {
      const res = await proxy(request(path));
      expect(res.headers.get('location')).toBeNull();
    }
  });

  it('does not add a redirect parameter when sign-in itself is requested', async () => {
    signedOut();

    const res = await proxy(request('/', {}));

    expect(new URL(res.headers.get('location')!).pathname).toBe('/auth/sign-in');
    expect(new URL(res.headers.get('location')!).searchParams.has('redirect')).toBe(false);
  });
});

describe('role resolution', () => {
  it('never sends a user with unknown roles to onboarding', async () => {
    // No user_roles cookie means the server has not checked yet; treating that
    // as "roleless" bounced every fresh login into choose-role.
    const res = await proxy(request('/student/dashboard'));

    expect(res.headers.get('location')).toBeNull();
  });

  it('sends a resolved roleless account to onboarding', async () => {
    const res = await proxy(request('/student/dashboard', ROLES([])));

    expect(new URL(res.headers.get('location')!).pathname).toBe('/onboarding/choose-role');
  });

  it('lets a roleless account reach the onboarding screen itself', async () => {
    const res = await proxy(request('/onboarding/choose-role', ROLES([])));

    expect(res.headers.get('location')).toBeNull();
  });

  it('bounces an already-assigned user out of onboarding', async () => {
    const res = await proxy(
      request('/onboarding/choose-role', { ...ROLES(['TEACHER']), active_role: 'TEACHER' })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/consultant/dashboard');
  });

  it('sends an unknown-role user on the root to the student dashboard', async () => {
    // Root is exempt from the onboarding rule so a roleless account is not stuck
    // between two redirects.
    const res = await proxy(request('/', ROLES([])));

    expect(new URL(res.headers.get('location')!).pathname).toBe('/student/dashboard');
  });

  it('falls back to the active role when the roles list is missing', async () => {
    const res = await proxy(request('/onboarding/choose-role', { active_role: 'BOTH' }));

    const location = new URL(res.headers.get('location')!);
    // BOTH is not TEACHER, and the list derived from it holds STUDENT.
    expect(location.pathname).toBe('/student/dashboard');
  });
});

describe('role-based route gating', () => {
  it('redirects a teacher on a student route to the teacher dashboard', async () => {
    const res = await proxy(
      request('/student/settings', { ...ROLES(['TEACHER', 'STUDENT', 'BOTH']), active_role: 'TEACHER' })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/consultant/dashboard');
  });

  it('redirects a student on a consultant route to the student dashboard', async () => {
    const res = await proxy(
      request('/consultant/services', { ...ROLES(['TEACHER', 'STUDENT', 'BOTH']), active_role: 'STUDENT' })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/student/dashboard');
  });

  it('keeps a shared route open for both roles', async () => {
    const res = await proxy(
      request('/astrology/navatara', { ...ROLES(['TEACHER', 'STUDENT', 'BOTH']), active_role: 'TEACHER' })
    );

    expect(res.headers.get('location')).toBeNull();
  });

  it('blocks a student from a consultant-only route', async () => {
    const res = await proxy(request('/consultant/services', ROLES(['STUDENT'])));

    expect(new URL(res.headers.get('location')!).pathname).toBe('/student/dashboard');
  });

  it('blocks a teacher from a student-only route', async () => {
    const res = await proxy(
      request('/student/ai-chirologist', { ...ROLES(['TEACHER']), active_role: 'TEACHER' })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/consultant/dashboard');
  });

  it('lets an authorised pair through', async () => {
    const res = await proxy(request('/student/dashboard', ROLES(['STUDENT'])));

    expect(res.headers.get('location')).toBeNull();
    expect(res.status).toBe(200);
  });

  it('ignores a forged role list in an unknown-role request', async () => {
    // Corrupt cookie JSON parses to nothing, and the request stays relaxed rather
    // than gating on attacker-controlled roles.
    const res = await proxy(request('/consultant/services', { user_roles: '%7Bbroken' }));

    expect(res.headers.get('location')).toBeNull();
  });
});

describe('authenticated visitors on auth pages', () => {
  it('pushes a logged-in teacher away from sign-in', async () => {
    const res = await proxy(
      request('/auth/sign-in', { ...ROLES(['TEACHER']), active_role: 'TEACHER' })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/consultant/dashboard');
  });

  it('lets a logged-in user open password recovery', async () => {
    const res = await proxy(request('/auth/reset-password', ROLES(['STUDENT'])));

    expect(res.headers.get('location')).toBeNull();
  });
});

describe('middleware matcher', () => {
  it('skips API routes and static assets', () => {
    // Next anchors matcher patterns at both ends, so the test must too.
    const pattern = new RegExp(`^${config.matcher[0]}$`);
    const guarded = (path: string) => pattern.test(path);

    expect(guarded('/student/dashboard')).toBe(true);
    expect(guarded('/onboarding/choose-role')).toBe(true);
    expect(guarded('/api/backend/auth/set-role/')).toBe(false);
    expect(guarded('/api/auth/session')).toBe(false);
    expect(guarded('/_next/static/chunks/app.js')).toBe(false);
    expect(guarded('/_next/image?url=%2Fx.png')).toBe(false);
    expect(guarded('/favicon.ico')).toBe(false);
  });
});
