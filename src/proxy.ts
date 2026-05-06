import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { ROUTES } from './constants/routes';

/**
 * Route classification — mirrors the old middleware but now validated
 * against the Supabase JWT session instead of a manual access_token cookie.
 */
const STUDENT_ROUTES = [
  ROUTES.STUDENT.DASHBOARD,
  ROUTES.STUDENT.TEACHERS,
  ROUTES.STUDENT.AI_CHIROLOGIST,
  ROUTES.STUDENT.CHAT,
  ROUTES.STUDENT.MEETINGS,
  ROUTES.STUDENT.HISTORY,
  ROUTES.STUDENT.SESSION_REPORT,
  ROUTES.STUDENT.SETTINGS,
  ROUTES.AGENT.ASTROLOGY,
];

const TEACHER_ROUTES = [
  ROUTES.TEACHER.DASHBOARD,
  ROUTES.TEACHER.CHAT,
  ROUTES.TEACHER.MEETINGS,
  ROUTES.TEACHER.SERVICES,
  ROUTES.TEACHER.SETTINGS,
  ROUTES.TEACHER.BLOGS,
  ROUTES.TEACHER.ASTROLOGY_STUDENTS,
];

const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_EMAIL,
  ROUTES.AUTH.CALLBACK,
  ROUTES.AUTH.AUTH_CODE_ERROR,
  ROUTES.ONBOARDING.CHOOSE_ROLE,
  ROUTES.AI_SESSION.ROOT,
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
 * 3. Redirect authenticated users away from auth pages to their dashboard.
 * 4. Enforce role-based route access.
 *
 * Token refresh is handled HERE automatically by @supabase/ssr —
 * no Django endpoint needed.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response object we can mutate (needed for cookie writes)
  let supabaseResponse = NextResponse.next({ request });

  // Instantiate a server-side Supabase client that reads/writes cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to both the request (for this middleware pass)
          // and the response (so the browser receives them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
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

  // Read role from custom cookies set by the auth-context (client-side)
  // This lets the middleware enforce role-based access without a DB call.
  const activeRole =
    request.cookies.get('active_role')?.value ||
    request.cookies.get('user_role')?.value;

  const userRolesStr = request.cookies.get('user_roles')?.value;
  let userRoles: ('STUDENT' | 'TEACHER')[] = [];
  if (userRolesStr) {
    try {
      userRoles = JSON.parse(userRolesStr);
    } catch {
      userRoles = [];
    }
  }
  if (userRoles.length === 0 && activeRole) {
    userRoles = [activeRole as 'STUDENT' | 'TEACHER'];
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // ── Public routes ────────────────────────────────────────────────────────
  if (isPublicRoute) {
    const isAuthPage =
      pathname.startsWith(ROUTES.AUTH.LOGIN) ||
      pathname.startsWith(ROUTES.AUTH.SIGNUP);

    // Redirect authenticated users away from sign-in/sign-up pages
    if (isAuthPage && user) {
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (redirectParam) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }
      const roleToUse = activeRole || userRoles[0];
      if (roleToUse === 'TEACHER') {
        return NextResponse.redirect(new URL(ROUTES.TEACHER.DASHBOARD, request.url));
      }
      return NextResponse.redirect(new URL(ROUTES.STUDENT.DASHBOARD, request.url));
    }

    return supabaseResponse;
  }

  // ── Not authenticated → sign-in ─────────────────────────────────────────
  if (!user) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated but no role yet → onboarding ──────────────────────────
  // This covers new Google/One-Tap users who haven't picked a role
  if (userRoles.length === 0 && pathname !== '/') {
    if (!pathname.startsWith(ROUTES.ONBOARDING.CHOOSE_ROLE)) {
      return NextResponse.redirect(new URL(ROUTES.ONBOARDING.CHOOSE_ROLE, request.url));
    }
    return supabaseResponse;
  }

  // ── Root path: redirect to dashboard ────────────────────────────────────
  if (pathname === ROUTES.HOME) {
    const roleToUse = activeRole || userRoles[0];
    if (roleToUse === 'TEACHER') {
      return NextResponse.redirect(new URL(ROUTES.TEACHER.DASHBOARD, request.url));
    }
    return NextResponse.redirect(new URL(ROUTES.STUDENT.DASHBOARD, request.url));
  }

  // ── Role-based route enforcement ─────────────────────────────────────────
  const isStudentRoute = STUDENT_ROUTES.some((route) => pathname.startsWith(route));
  const isTeacherRoute = TEACHER_ROUTES.some((route) => pathname.startsWith(route));

  if (isStudentRoute && !userRoles.includes('STUDENT')) {
    const roleToUse = activeRole || userRoles[0];
    if (roleToUse === 'TEACHER') {
      return NextResponse.redirect(new URL(ROUTES.TEACHER.DASHBOARD, request.url));
    }
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  if (isTeacherRoute && !userRoles.includes('TEACHER')) {
    const roleToUse = activeRole || userRoles[0];
    if (roleToUse === 'STUDENT') {
      return NextResponse.redirect(new URL(ROUTES.STUDENT.DASHBOARD, request.url));
    }
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
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
