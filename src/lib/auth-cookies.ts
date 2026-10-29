import { API_ROUTES } from '@/constants/api-routes';
import type { UserRole } from '@/types/user';

export const USER_ROLES_COOKIE = 'user_roles';
export const ACTIVE_ROLE_COOKIE = 'active_role';

// Chrome caps cookie lifetime at 400 days regardless of what we ask for.
const ROLE_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

const KNOWN_ROLES = new Set<UserRole>(['STUDENT', 'TEACHER', 'BOTH']);

const isSecure = process.env.NODE_ENV === 'production';

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

function roleCookieOptions(maxAge: number) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecure,
    maxAge,
  };
}

function setCookie(response: Response, name: string, value: string, maxAge: number) {
  const options = roleCookieOptions(maxAge);
  const parts = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
    'HttpOnly',
  ];
  if (options.secure) parts.push('Secure');
  response.headers.append('Set-Cookie', parts.join('; '));
}

/**
 * Roles drive route protection in proxy.ts, so they must only ever be written by
 * the server from backend-verified data. httpOnly makes them unforgeable from JS.
 *
 * An empty role list is written as `[]` rather than cleared: the presence of the
 * cookie means "the server checked and this account has no role", while its
 * absence means "unknown" — which must never send anybody to onboarding.
 */
export function writeRoleCookies(
  response: Response,
  roles: UserRole[],
  activeRole: UserRole | null
) {
  setCookie(
    response,
    USER_ROLES_COOKIE,
    encodeURIComponent(JSON.stringify(roles)),
    ROLE_COOKIE_MAX_AGE
  );
  setCookie(response, ACTIVE_ROLE_COOKIE, activeRole ?? '', ROLE_COOKIE_MAX_AGE);
}

export function clearRoleCookies(response: Response) {
  setCookie(response, USER_ROLES_COOKIE, '', 0);
  setCookie(response, ACTIVE_ROLE_COOKIE, '', 0);
}

export function readRoleCookies(cookies: CookieReader): {
  rolesKnown: boolean;
  userRoles: UserRole[];
  activeRole: UserRole | null;
} {
  const raw = cookies.get(USER_ROLES_COOKIE)?.value;
  const rawActive = cookies.get(ACTIVE_ROLE_COOKIE)?.value as UserRole | undefined;
  const active = rawActive && KNOWN_ROLES.has(rawActive) ? rawActive : undefined;

  // A cookie we cannot read is not a cookie that says "no roles" — only a parsed
  // array counts as known, so the caller stays relaxed instead of onboarding.
  let parsed: UserRole[] | null = null;
  if (raw) {
    try {
      const value: unknown = JSON.parse(decodeURIComponent(raw));
      if (Array.isArray(value)) {
        parsed = value.filter((role): role is UserRole => KNOWN_ROLES.has(role as UserRole));
      }
    } catch {
      parsed = null;
    }
  }

  // Mirror the role list an active BOTH role implies, when no list came along.
  let userRoles = parsed;
  if (userRoles === null && active) {
    userRoles = active === 'BOTH' ? ['STUDENT', 'TEACHER'] : [active];
  }

  return {
    rolesKnown: parsed !== null,
    userRoles: userRoles ?? [],
    activeRole: active ?? null,
  };
}

/**
 * has_teacher / has_student from Django -> the role list the client UI expects.
 * A dual-role account also carries BOTH, matching the previous client behaviour.
 * A missing body is treated as "no roles" so a 200 with `null` cannot throw.
 */
export function rolesFromProfileFlags(profile?: {
  has_teacher?: boolean;
  has_student?: boolean;
} | null): UserRole[] {
  const roles: UserRole[] = [];
  if (profile?.has_teacher) roles.push('TEACHER');
  if (profile?.has_student) roles.push('STUDENT');
  if (profile?.has_teacher && profile?.has_student) roles.push('BOTH');
  return roles;
}

export function pickActiveRole(
  roles: UserRole[],
  current?: UserRole | null
): UserRole | null {
  if (current && roles.includes(current)) return current;
  if (roles.includes('STUDENT')) return 'STUDENT';
  return roles[0] ?? null;
}

/**
 * Authoritative role lookup. Never trusts a cookie value — the roles come back
 * from Django using the caller's verified Supabase access token.
 */
export async function fetchRoles(accessToken: string): Promise<UserRole[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.ME}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Role lookup failed (${res.status})`);
  }

  return rolesFromProfileFlags(await res.json());
}
