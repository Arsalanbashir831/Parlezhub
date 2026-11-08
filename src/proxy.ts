import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { readRoleCookies } from '@/lib/auth-cookies';
import { HOME_PATH } from '@/lib/guard-rules';

import { ROUTES } from './constants/routes';

/**
 * Route classification — mirrors the old middleware but now validated
 * against the Supabase JWT session instead of a manual access_token cookie.
 */
const STUDENT_ROUTES = [
  ROUTES.STUDENT.HISTORY,
  ROUTES.STUDENT.SETTINGS,
  ROUTES.AGENT.ASTROLOGY.ROOT,
];

const STUDENT_ONLY_ASTROLOGY_ROUTES = [
  ROUTES.AGENT.ASTROLOGY.ASTROLOGERS,
  ROUTES.AGENT.ASTROLOGY.HIRE.ROOT,
];

const TEACHER_ROUTES = [ROUTES.TEACHER.SETTINGS, ROUTES.AGENT.ASTROLOGY.ROOT];

/**
 * Workspace pages that moved into the observatory. Old bookmarks and links in
 * sent emails keep working: the path (and its sub-paths) is rewritten to the
 * new home, the query string is kept.
 */
const LEGACY_REDIRECTS: [from: string, to: string][] = [
  ['/student/dashboard', HOME_PATH],
  ['/consultant/dashboard', HOME_PATH],
  ['/student/consultants', ROUTES.AGENT.ASTROLOGY.ASTROLOGERS],
  ['/student/chat', ROUTES.AGENT.ASTROLOGY.HIRE.CHAT],
  ['/student/meetings', ROUTES.AGENT.ASTROLOGY.HIRE.MEETINGS],
  ['/consultant/services', ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS],
  ['/consultant/chat', ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT],
  ['/consultant/meetings', ROUTES.AGENT.ASTROLOGY.SERVICE.MEETINGS],
];

const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_EMAIL,
  ROUTES.AUTH.CALLBACK,
  ROUTES.AUTH.AUTH_CODE_ERROR,
  ROUTES.AGENT.LANGUAGE,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  '/placeholders',
];

/**
 * Next.js Middleware — runs on every matched request on the Edge.
 *
 * Responsibilities:
 * 1. Refresh the Supabase session (keeps HTTP-only cookies fresh).
 * 2. Protect routes: redirect unauthenticated users to sign-in.
 * 3. Redirect authenticated users away from auth pages to their home workspace.
 * 4. Enforce role-based route access.
 *
 * Token refresh is handled HERE automatically by @supabase/ssr —
 * no Django endpoint needed.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept password reset or authentication callback codes landing on root "/"
  if (pathname === ROUTES.HOME) {
    if (request.nextUrl.searchParams.has('code')) {
      const callbackUrl = new URL(ROUTES.AUTH.CALLBACK, request.url);
      request.nextUrl.searchParams.forEach((val, key) => {
        callbackUrl.searchParams.set(key, val);
      });
      return NextResponse.redirect(callbackUrl);
    }

    if (request.nextUrl.searchParams.get('type') === 'recovery') {
      const resetUrl = new URL(ROUTES.AUTH.RESET_PASSWORD, request.url);
      request.nextUrl.searchParams.forEach((val, key) => {
        resetUrl.searchParams.set(key, val);
      });
      return NextResponse.redirect(resetUrl);
    }
  }

  const legacy = LEGACY_REDIRECTS.find(
    ([from]) => pathname === from || pathname.startsWith(`${from}/`)
  );
  if (legacy) {
    const target = new URL(legacy[1], request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  // Create a response object we can mutate (needed for cookie writes)
  let supabaseResponse = NextResponse.next({ request });

  // Instantiate a server-side Supabase client that reads/writes cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Write cookies to both the request (for this middleware pass)
          // and the response (so the browser receives them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // Responses that set auth cookies must not be cached by a CDN or
          // reverse proxy, or one user's session can be served to another.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  /**
   * IMPORTANT: Do not add any logic between createServerClient and
   * supabase.auth.getClaims(). The getClaims() call is what triggers
   * the token refresh and cookie update.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Read roles from cookies
  const { rolesKnown, userRoles, activeRole } = readRoleCookies(
    request.cookies
  );

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // ── Unauthenticated Users ───────────────────────────────────────────────
  if (!user) {
    if (isPublicRoute) return supabaseResponse;
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    if (pathname !== '/') loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated Users ──────────────────────────────────────────────────

  // 1. Prevent access to auth pages (login/signup) if already logged in
  if (
    isPublicRoute &&
    (pathname.startsWith(ROUTES.AUTH.LOGIN) ||
      pathname.startsWith(ROUTES.AUTH.SIGNUP))
  ) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // 2. If the server resolved NO roles, send the user to onboarding
  if (
    rolesKnown &&
    userRoles.length === 0 &&
    !isPublicRoute &&
    !pathname.startsWith(ROUTES.ONBOARDING.CHOOSE_ROLE) &&
    pathname !== '/'
  ) {
    return NextResponse.redirect(
      new URL(ROUTES.ONBOARDING.CHOOSE_ROLE, request.url)
    );
  }

  // 3. If user ALREADY has roles but is trying to access onboarding, send them home
  if (
    userRoles.length > 0 &&
    pathname.startsWith(ROUTES.ONBOARDING.CHOOSE_ROLE)
  ) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // 3. Root redirect
  if (pathname === ROUTES.HOME) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // 4. Role-based route protection (Strict Enforcement). While roles are unknown
  // the guard is relaxed: /api/auth/session resolves them and the client-side
  // RoleGuard enforces immediately, so the next navigation is fully gated.
  if (!rolesKnown) return supabaseResponse;

  const isStudentRoute = STUDENT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isStudentOnlyAstrologyRoute = STUDENT_ONLY_ASTROLOGY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isTeacherRoute =
    !isStudentOnlyAstrologyRoute &&
    TEACHER_ROUTES.some((route) => pathname.startsWith(route));

  // If on a student route but active role is TEACHER (and it's NOT also a teacher route)
  if (
    isStudentRoute &&
    !isTeacherRoute &&
    activeRole === 'TEACHER' &&
    userRoles.includes('TEACHER')
  ) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // If on a teacher route but active role is STUDENT (and it's NOT also a student route)
  if (
    isTeacherRoute &&
    !isStudentRoute &&
    activeRole === 'STUDENT' &&
    userRoles.includes('STUDENT')
  ) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  // Basic access check (if they don't even have the required role)
  if (isStudentRoute && !isTeacherRoute && !userRoles.includes('STUDENT')) {
    const target = userRoles.includes('TEACHER')
      ? HOME_PATH
      : ROUTES.ONBOARDING.CHOOSE_ROLE;
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isTeacherRoute && !isStudentRoute && !userRoles.includes('TEACHER')) {
    const target = userRoles.includes('STUDENT')
      ? HOME_PATH
      : ROUTES.ONBOARDING.CHOOSE_ROLE;
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Allow the request through; supabaseResponse carries updated cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes (Next.js API routes — not Django)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
