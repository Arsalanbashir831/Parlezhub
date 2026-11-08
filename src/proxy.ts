import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import {
  AUTH_APP_COOKIE,
  DEFAULT_APP,
  isAppId,
  appFromPath,
  authRoutes,
  isAuthPath,
  isOnboardingPath,
} from '@/lib/apps';
import { readRoleCookies } from '@/lib/auth-cookies';
import { HOME_PATH, homePath } from '@/lib/guard-rules';

import { ROUTES } from './constants/routes';

/**
 * Role gating inside the astrology app, validated against the Supabase JWT
 * session. The observatory is one workspace for both roles; only hiring pages
 * are student-only (the service pages are guarded client-side by
 * ConsultantGuard). Parlezhub has no role-restricted routes yet.
 */
const STUDENT_ROUTES = [ROUTES.AGENT.ASTROLOGY.ROOT];

const STUDENT_ONLY_ASTROLOGY_ROUTES = [
  ROUTES.AGENT.ASTROLOGY.ASTROLOGERS,
  ROUTES.AGENT.ASTROLOGY.HIRE.ROOT,
];

const TEACHER_ROUTES = [ROUTES.AGENT.ASTROLOGY.ROOT];

const astrologyAuth = authRoutes('astrology');

interface LegacyRedirect {
  from: string;
  to: string;
  /** Carry the rest of the path over (/auth/x → /astrology/auth/x). */
  keepSubpath?: boolean;
}

/**
 * Retired URLs. Old bookmarks and links in sent emails keep working: the path
 * (and its sub-paths) is rewritten to its new home, the query string is kept.
 * The first match wins, so the specific entries come before the catch-alls.
 */
const LEGACY_REDIRECTS: LegacyRedirect[] = [
  // Auth and onboarding moved into the astrology app. The sub-path is kept so
  // /auth/callback?code=… from an email sent before the move still signs in.
  { from: '/auth', to: astrologyAuth.authBase, keepSubpath: true },
  { from: '/onboarding', to: astrologyAuth.onboarding },
  { from: '/student/consultants', to: ROUTES.AGENT.ASTROLOGY.ASTROLOGERS },
  { from: '/student/chat', to: ROUTES.AGENT.ASTROLOGY.HIRE.CHAT },
  { from: '/student/meetings', to: ROUTES.AGENT.ASTROLOGY.HIRE.MEETINGS },
  { from: '/consultant/services', to: ROUTES.AGENT.ASTROLOGY.SERVICE.GIGS },
  { from: '/consultant/chat', to: ROUTES.AGENT.ASTROLOGY.SERVICE.CHAT },
  { from: '/consultant/meetings', to: ROUTES.AGENT.ASTROLOGY.SERVICE.MEETINGS },
  { from: '/student', to: HOME_PATH },
  { from: '/consultant', to: HOME_PATH },
  { from: '/language', to: HOME_PATH },
];

function legacyTarget(pathname: string): string | null {
  for (const { from, to, keepSubpath } of LEGACY_REDIRECTS) {
    if (pathname === from || pathname.startsWith(`${from}/`)) {
      return keepSubpath ? to + pathname.slice(from.length) : to;
    }
  }
  return null;
}

/** Pages every app shares. Each app's /<app>/auth/* pages are public as well. */
const SHARED_PUBLIC_ROUTES = [ROUTES.TERMS, ROUTES.PRIVACY, '/placeholders'];

const isPublicPath = (pathname: string) =>
  isAuthPath(pathname) ||
  SHARED_PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

/**
 * Next.js Middleware — runs on every matched request on the Edge.
 *
 * Responsibilities:
 * 1. Refresh the Supabase session (keeps HTTP-only cookies fresh).
 * 2. Protect routes: redirect unauthenticated users to sign-in.
 * 3. Redirect authenticated users away from auth pages to their home workspace.
 * 4. Enforce role-based route access.
 *
 * Every redirect stays inside the app the request is for (its path prefix):
 * a Parlezhub page sends a signed-out visitor to Parlezhub's sign-in. "/" and
 * shared pages belong to the default app.
 *
 * Token refresh is handled HERE automatically by @supabase/ssr —
 * no Django endpoint needed.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const app = appFromPath(pathname);
  const routes = authRoutes(app);
  const home = homePath(app);

  // Intercept password reset or authentication callback codes landing on root
  // "/" (Supabase's Site URL fallback, used when it rejects an app's callback
  // URL). The app a Google sign-in started from is remembered in a cookie, so
  // its code still reaches that app; anything else belongs to the default app.
  if (pathname === ROUTES.HOME) {
    const startedIn = request.cookies.get(AUTH_APP_COOKIE)?.value;
    const rootRoutes = authRoutes(isAppId(startedIn) ? startedIn : DEFAULT_APP);
    if (request.nextUrl.searchParams.has('code')) {
      const callbackUrl = new URL(rootRoutes.callback, request.url);
      request.nextUrl.searchParams.forEach((val, key) => {
        callbackUrl.searchParams.set(key, val);
      });
      return NextResponse.redirect(callbackUrl);
    }

    if (request.nextUrl.searchParams.get('type') === 'recovery') {
      const resetUrl = new URL(rootRoutes.resetPassword, request.url);
      request.nextUrl.searchParams.forEach((val, key) => {
        resetUrl.searchParams.set(key, val);
      });
      return NextResponse.redirect(resetUrl);
    }
  }

  const legacy = legacyTarget(pathname);
  if (legacy) {
    const target = new URL(legacy, request.url);
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

  const isPublicRoute = isPublicPath(pathname);

  // ── Unauthenticated Users ───────────────────────────────────────────────
  if (!user) {
    if (isPublicRoute) return supabaseResponse;
    const loginUrl = new URL(routes.login, request.url);
    if (pathname !== '/') loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated Users ──────────────────────────────────────────────────

  // 1. Prevent access to auth pages (login/signup) if already logged in
  if (
    pathname.startsWith(routes.login) ||
    pathname.startsWith(routes.signup)
  ) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // The other public pages (callback, reset/verify email, terms) stay open to
  // a live session and take no part in onboarding or role gating.
  if (isPublicRoute) return supabaseResponse;

  // 2. If the server resolved NO roles, send the user to this app's onboarding
  if (
    rolesKnown &&
    userRoles.length === 0 &&
    !isOnboardingPath(pathname) &&
    pathname !== '/'
  ) {
    return NextResponse.redirect(new URL(routes.onboarding, request.url));
  }

  // 3. If user ALREADY has roles but is trying to access onboarding, send them home
  if (userRoles.length > 0 && isOnboardingPath(pathname)) {
    return NextResponse.redirect(new URL(home, request.url));
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
    return NextResponse.redirect(new URL(home, request.url));
  }

  // If on a teacher route but active role is STUDENT (and it's NOT also a student route)
  if (
    isTeacherRoute &&
    !isStudentRoute &&
    activeRole === 'STUDENT' &&
    userRoles.includes('STUDENT')
  ) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Basic access check (if they don't even have the required role)
  if (isStudentRoute && !isTeacherRoute && !userRoles.includes('STUDENT')) {
    const target = userRoles.includes('TEACHER') ? home : routes.onboarding;
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isTeacherRoute && !isStudentRoute && !userRoles.includes('TEACHER')) {
    const target = userRoles.includes('STUDENT') ? home : routes.onboarding;
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
     * - image files served from /public (e.g. /parlezhub/auth-showcase.webp):
     *   they sit under app prefixes, and the sign-in pages that show them are
     *   seen signed out, so they must never be gated (or pay for a session check)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
