import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ACTIVE_ROLE_COOKIE,
  USER_ROLES_COOKIE,
  clearRoleCookies,
  pickActiveRole,
  readRoleCookies,
  rolesFromProfileFlags,
  writeRoleCookies,
} from '@/lib/auth-cookies';
import type { UserRole } from '@/types/user';

/** Collects the Set-Cookie headers a Response would emit. */
function collectCookies(response: Response): Record<string, string> {
  const raw = response.headers.getSetCookie();
  const parsed: Record<string, string> = {};
  for (const line of raw) {
    const [pair, ...attrs] = line.split(';');
    const index = pair.indexOf('=');
    const name = pair.slice(0, index).trim();
    parsed[name] = decodeURIComponent(pair.slice(index + 1)) + `|${attrs.join(';')}`;
  }
  return parsed;
}

function cookieJar(cookies: Record<string, string | undefined>) {
  return {
    get(name: string) {
      const value = cookies[name];
      return value === undefined ? undefined : { value };
    },
  };
}

describe('role cookie serialization', () => {
  it('writes both cookies as HttpOnly, site-wide and long lived', () => {
    const response = new Response(null);
    writeRoleCookies(response, ['STUDENT'], 'STUDENT');

    const jar = response.headers.getSetCookie();
    expect(jar).toHaveLength(2);
    for (const line of jar) {
      expect(line).toContain('HttpOnly');
      expect(line).toContain('Path=/');
      expect(line).toContain('SameSite=lax');
      expect(line).toContain('Max-Age=34560000');
    }
    // Never leaks the token-bearing session cookie alongside roles.
    expect(jar.join('')).not.toMatch(/sb-/);
  });

  it('marks cookies Secure only in production', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    const production = await import('@/lib/auth-cookies');

    const response = new Response(null);
    production.writeRoleCookies(response, ['STUDENT'], 'STUDENT');

    expect(response.headers.getSetCookie().join('')).toContain('Secure');
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('writes an explicit empty list for a roleless account instead of clearing', () => {
    const response = new Response(null);
    writeRoleCookies(response, [], null);

    const cookies = collectCookies(response);
    expect(JSON.parse(cookies[USER_ROLES_COOKIE].split('|')[0])).toEqual([]);
    expect(cookies[ACTIVE_ROLE_COOKIE].split('|')[0]).toBe('');
    expect(cookies[USER_ROLES_COOKIE]).toContain('Max-Age=34560000');
  });

  it('clears both cookies with Max-Age=0', () => {
    const response = new Response(null);
    clearRoleCookies(response);

    const jar = response.headers.getSetCookie();
    expect(jar).toHaveLength(2);
    expect(jar.every((line) => line.includes('Max-Age=0'))).toBe(true);
    expect(jar.every((line) => line.includes('HttpOnly'))).toBe(true);
  });
});

describe('readRoleCookies', () => {
  it('treats a missing cookie as "unknown", not "roleless"', () => {
    const result = readRoleCookies(cookieJar({}));

    expect(result).toEqual({ rolesKnown: false, userRoles: [], activeRole: null });
  });

  it('treats a present but empty list as a known roleless account', () => {
    const result = readRoleCookies(
      cookieJar({ [USER_ROLES_COOKIE]: encodeURIComponent('[]') })
    );

    expect(result.rolesKnown).toBe(true);
    expect(result.userRoles).toEqual([]);
  });

  it('round-trips the roles and active role the server wrote', () => {
    const response = new Response(null);
    writeRoleCookies(response, ['TEACHER', 'STUDENT', 'BOTH'], 'BOTH');

    const cookies: Record<string, string | undefined> = {};
    for (const line of response.headers.getSetCookie()) {
      const [pair] = line.split(';');
      const index = pair.indexOf('=');
      cookies[pair.slice(0, index).trim()] = pair.slice(index + 1);
    }

    expect(readRoleCookies(cookieJar(cookies))).toEqual({
      rolesKnown: true,
      userRoles: ['TEACHER', 'STUDENT', 'BOTH'],
      activeRole: 'BOTH',
    });
  });

  it('derives both roles from an active BOTH cookie when the list is absent', () => {
    const result = readRoleCookies(cookieJar({ [ACTIVE_ROLE_COOKIE]: 'BOTH' }));

    expect(result.userRoles).toEqual(['STUDENT', 'TEACHER']);
    expect(result.activeRole).toBe('BOTH');
    // Derived from active_role only: the roles list itself was never written.
    expect(result.rolesKnown).toBe(false);
  });

  it('survives a corrupted roles cookie without throwing', () => {
    const result = readRoleCookies(
      cookieJar({ [USER_ROLES_COOKIE]: '%7Bnot-json', [ACTIVE_ROLE_COOKIE]: 'STUDENT' })
    );

    expect(result.userRoles).toEqual(['STUDENT']);
    expect(result.activeRole).toBe('STUDENT');
  });

  it('treats a roles cookie that is not an array as unknown', () => {
    const result = readRoleCookies(
      cookieJar({ [USER_ROLES_COOKIE]: encodeURIComponent('{"admin":true}') })
    );

    expect(result.rolesKnown).toBe(false);
    expect(result.userRoles).toEqual([]);
  });

  it('treats unparseable roles as unknown, not as "no roles"', () => {
    // The distinction decides whether middleware sends the user to onboarding.
    const result = readRoleCookies(cookieJar({ [USER_ROLES_COOKIE]: '%7Bnot-json' }));

    expect(result.rolesKnown).toBe(false);
    expect(result.userRoles).toEqual([]);
  });

  it('drops unknown role names but keeps the valid ones', () => {
    const result = readRoleCookies(
      cookieJar({
        [USER_ROLES_COOKIE]: encodeURIComponent('["STUDENT","SUPERUSER"]'),
        [ACTIVE_ROLE_COOKIE]: 'SUPERUSER',
      })
    );

    expect(result.userRoles).toEqual(['STUDENT']);
    expect(result.activeRole).toBeNull();
  });
});

describe('rolesFromProfileFlags', () => {
  it.each([
    [{ has_teacher: true, has_student: false }, ['TEACHER']],
    [{ has_teacher: false, has_student: true }, ['STUDENT']],
    [{}, []],
    [undefined, []],
  ] as const)('maps %j to %j', (profile, expected) => {
    expect(rolesFromProfileFlags(profile as never)).toEqual(expected);
  });

  it('adds BOTH for a dual-role account', () => {
    expect(rolesFromProfileFlags({ has_teacher: true, has_student: true })).toEqual([
      'TEACHER',
      'STUDENT',
      'BOTH',
    ]);
  });
});

describe('pickActiveRole', () => {
  const roles: UserRole[] = ['TEACHER', 'STUDENT', 'BOTH'];

  it('keeps a still-valid current role', () => {
    expect(pickActiveRole(roles, 'TEACHER')).toBe('TEACHER');
    expect(pickActiveRole(roles, 'BOTH')).toBe('BOTH');
  });

  it('drops a role the account no longer has', () => {
    expect(pickActiveRole(['STUDENT'], 'TEACHER')).toBe('STUDENT');
  });

  it('prefers STUDENT when nothing is selected', () => {
    expect(pickActiveRole(['TEACHER', 'STUDENT'])).toBe('STUDENT');
  });

  it('falls back to the first role, then to null', () => {
    expect(pickActiveRole(['TEACHER'])).toBe('TEACHER');
    expect(pickActiveRole([])).toBeNull();
  });
});

describe('fetchRoles', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://backend.test/api');
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('asks the backend with the bearer token and maps the flags', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ has_student: true }), {
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { fetchRoles } = await import('@/lib/auth-cookies');
    await expect(fetchRoles('token-123')).resolves.toEqual(['STUDENT']);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://backend.test/api/accounts/profiles/me/roles/');
    expect(init.headers).toEqual({ Authorization: 'Bearer token-123' });
    expect(init.cache).toBe('no-store');
  });

  it('rejects when the backend is unreachable, so callers can mark roles unknown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('boom', { status: 503 }))
    );

    const { fetchRoles } = await import('@/lib/auth-cookies');
    await expect(fetchRoles('token-123')).rejects.toThrow('Role lookup failed (503)');
  });

  it('rejects on a network error as well', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const { fetchRoles } = await import('@/lib/auth-cookies');
    await expect(fetchRoles('token-123')).rejects.toThrow('ECONNREFUSED');
  });

  it('maps an empty JSON body to no roles instead of throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('null', { headers: { 'content-type': 'application/json' } }))
    );

    const { fetchRoles } = await import('@/lib/auth-cookies');
    await expect(fetchRoles('token-123')).resolves.toEqual([]);
  });
});
