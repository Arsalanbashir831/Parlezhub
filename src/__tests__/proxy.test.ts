import { NextRequest } from 'next/server';
import { config, proxy } from '@/proxy';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser } })),
}));

function request(
  path = '/astrology/dasha',
  cookies: Record<string, string> = {}
) {
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

    expect(new URL(res.headers.get('location')!).pathname).toBe(
      '/auth/reset-password'
    );
  });
});

describe('unauthenticated visitors', () => {
  it('sends a protected route to sign-in with the intended path preserved', async () => {
    signedOut();

    const res = await proxy(request('/astrology/dasha'));

    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/auth/sign-in');
    expect(location.searchParams.get('redirect')).toBe('/astrology/dasha');
  });

  it('leaves public routes alone', async () => {
    signedOut();

    for (const path of [
      '/auth/sign-in',
      '/auth/signup',
      '/terms',
      '/privacy',
    ]) {
      const res = await proxy(request(path));
      expect(res.headers.get('location')).toBeNull();
    }
  });

  it('does not add a redirect parameter when sign-in itself is requested', async () => {
    signedOut();

    const res = await proxy(request('/', {}));

    expect(new URL(res.headers.get('location')!).pathname).toBe(
      '/auth/sign-in'
    );
    expect(
      new URL(res.headers.get('location')!).searchParams.has('redirect')
    ).toBe(false);
  });
});

describe('role resolution', () => {
  it('never sends a user with unknown roles to onboarding', async () => {
    // No user_roles cookie means the server has not checked yet; treating that
    // as "roleless" bounced every fresh login into choose-role.
    const res = await proxy(request('/astrology/dasha'));

    expect(res.headers.get('location')).toBeNull();
  });

  it('sends a resolved roleless account to onboarding', async () => {
    const res = await proxy(request('/astrology/dasha', ROLES([])));

    expect(new URL(res.headers.get('location')!).pathname).toBe(
      '/onboarding/choose-role'
    );
  });

  it('lets a roleless account reach the onboarding screen itself', async () => {
    const res = await proxy(request('/onboarding/choose-role', ROLES([])));

    expect(res.headers.get('location')).toBeNull();
  });

  it('bounces an already-assigned user out of onboarding', async () => {
    const res = await proxy(
      request('/onboarding/choose-role', {
        ...ROLES(['TEACHER']),
        active_role: 'TEACHER',
      })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });

  it('sends a roleless account on the root to the same home as everybody else', async () => {
    // Root is exempt from the onboarding rule so a roleless account is not stuck
    // between two redirects.
    const res = await proxy(request('/', ROLES([])));

    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });

  it('sends a teacher on the root to the astrology workspace', async () => {
    const res = await proxy(
      request('/', { ...ROLES(['TEACHER']), active_role: 'TEACHER' })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });

  it('falls back to the active role when the roles list is missing', async () => {
    const res = await proxy(
      request('/onboarding/choose-role', { active_role: 'BOTH' })
    );

    // BOTH still counts as an assigned role, so onboarding lets go of them.
    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });
});

describe('role-based route gating', () => {
  it('redirects a teacher on a student route to the astrology workspace', async () => {
    const res = await proxy(
      request('/astrology/astrologers', {
        ...ROLES(['TEACHER', 'STUDENT', 'BOTH']),
        active_role: 'TEACHER',
      })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });

  it('leaves the astrologer service pages to the client-side ConsultantGuard', async () => {
    // Every observatory route is open to both roles at the proxy; the service
    // layout's ConsultantGuard is what turns a student away.
    const res = await proxy(
      request('/astrology/service/gigs', {
        ...ROLES(['TEACHER', 'STUDENT', 'BOTH']),
        active_role: 'STUDENT',
      })
    );

    expect(res.headers.get('location')).toBeNull();
  });

  it('keeps a shared route open for both roles', async () => {
    const res = await proxy(
      request('/astrology/navatara', {
        ...ROLES(['TEACHER', 'STUDENT', 'BOTH']),
        active_role: 'TEACHER',
      })
    );

    expect(res.headers.get('location')).toBeNull();
  });

  it('keeps hire astrologer pages in the student role inside astrology', async () => {
    for (const path of [
      '/astrology/astrologers',
      '/astrology/hire/chat',
      '/astrology/hire/meetings',
    ]) {
      const student = await proxy(
        request(path, { ...ROLES(['STUDENT']), active_role: 'STUDENT' })
      );
      expect(student.headers.get('location')).toBeNull();

      const teacher = await proxy(
        request(path, {
          ...ROLES(['TEACHER', 'STUDENT']),
          active_role: 'TEACHER',
        })
      );
      expect(new URL(teacher.headers.get('location')!).pathname).toBe(
        '/astrology'
      );
    }
  });

  it('blocks a teacher from a student-only route', async () => {
    const res = await proxy(
      request('/astrology/hire/meetings', {
        ...ROLES(['TEACHER']),
        active_role: 'TEACHER',
      })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });

  it('lets an authorised pair through', async () => {
    const res = await proxy(
      request('/astrology/astrologers', {
        ...ROLES(['STUDENT']),
        active_role: 'STUDENT',
      })
    );

    expect(res.headers.get('location')).toBeNull();
  });

  it('ignores a forged role list in an unknown-role request', async () => {
    // Corrupt cookie JSON parses to nothing, and the request stays relaxed rather
    // than gating on attacker-controlled roles.
    const res = await proxy(
      request('/astrology/hire/chat', { user_roles: '%7Bbroken' })
    );

    expect(res.headers.get('location')).toBeNull();
  });
});

describe('authenticated visitors on auth pages', () => {
  it('pushes a logged-in teacher away from sign-in', async () => {
    const res = await proxy(
      request('/auth/sign-in', {
        ...ROLES(['TEACHER']),
        active_role: 'TEACHER',
      })
    );

    expect(new URL(res.headers.get('location')!).pathname).toBe('/astrology');
  });

  it('lets a logged-in user open password recovery', async () => {
    const res = await proxy(
      request('/auth/reset-password', ROLES(['STUDENT']))
    );

    expect(res.headers.get('location')).toBeNull();
  });
});

describe('middleware matcher', () => {
  it('skips API routes and static assets', () => {
    // Next anchors matcher patterns at both ends, so the test must too.
    const pattern = new RegExp(`^${config.matcher[0]}$`);
    const guarded = (path: string) => pattern.test(path);

    expect(guarded('/astrology')).toBe(true);
    expect(guarded('/onboarding/choose-role')).toBe(true);
    expect(guarded('/api/backend/auth/set-role/')).toBe(false);
    expect(guarded('/api/auth/session')).toBe(false);
    expect(guarded('/_next/static/chunks/app.js')).toBe(false);
    expect(guarded('/_next/image?url=%2Fx.png')).toBe(false);
    expect(guarded('/favicon.ico')).toBe(false);
  });
});

describe('legacy workspace URLs', () => {
  it('sends each retired page to its home in the observatory', async () => {
    const cases: [string, string][] = [
      ['/student/dashboard', '/astrology'],
      ['/consultant/dashboard', '/astrology'],
      ['/student/consultants', '/astrology/astrologers'],
      ['/student/chat', '/astrology/hire/chat'],
      ['/student/meetings', '/astrology/hire/meetings'],
      ['/consultant/services', '/astrology/service/gigs'],
      ['/consultant/services/edit/12', '/astrology/service/gigs'],
      ['/consultant/chat', '/astrology/service/chat'],
      ['/consultant/meetings', '/astrology/service/meetings'],
      ['/student/settings', '/astrology'],
      ['/student/history', '/astrology'],
      ['/consultant/settings', '/astrology'],
      ['/consultant/blogs/edit/3', '/astrology'],
      ['/language', '/astrology'],
    ];

    for (const [from, to] of cases) {
      const res = await proxy(request(from, ROLES(['STUDENT', 'TEACHER'])));
      expect(new URL(res.headers.get('location')!).pathname).toBe(to);
    }
  });

  it('keeps the query string, so links from sent emails still open the right thread', async () => {
    const res = await proxy(request('/consultant/chat?student=42'));

    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/astrology/service/chat');
    expect(location.searchParams.get('student')).toBe('42');
  });

  it('redirects before the sign-in check, so a signed-out visitor lands on sign-in for the new page', async () => {
    signedOut();

    const res = await proxy(request('/student/meetings'));

    expect(new URL(res.headers.get('location')!).pathname).toBe(
      '/astrology/hire/meetings'
    );
  });

  it('matches whole path segments, not bare prefixes', async () => {
    // '/students-guide' starts with '/student' but is not under it.
    const res = await proxy(
      request('/students-guide', {
        ...ROLES(['STUDENT']),
        active_role: 'STUDENT',
      })
    );

    expect(res.headers.get('location')).toBeNull();
  });
});
