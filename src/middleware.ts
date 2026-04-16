import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ROUTES } from './constants/routes';

// Define protected routes for each roleee
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
];

const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_EMAIL,
  ROUTES.AUTH.CALLBACK,
  ROUTES.AI_SESSION.ROOT,
  ROUTES.AGENT.LANGUAGE,
  '/placeholders',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    // Only restrict auth pages (sign-in, signup) for authenticated users
    const isAuthPage =
      pathname.startsWith(ROUTES.AUTH.LOGIN) ||
      pathname.startsWith(ROUTES.AUTH.SIGNUP);
    if (isAuthPage) {
      const accessToken = request.cookies.get('access_token')?.value;
      const activeRole =
        request.cookies.get('active_role')?.value ||
        request.cookies.get('user_role')?.value;
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (accessToken && activeRole) {
        // If a redirect param is present, honor it instead of forcing dashboard
        if (redirectParam) {
          return NextResponse.redirect(new URL(redirectParam, request.url));
        }
        if (activeRole === 'STUDENT') {
          return NextResponse.redirect(
            new URL(ROUTES.STUDENT.DASHBOARD, request.url)
          );
        }
        if (activeRole === 'TEACHER') {
          return NextResponse.redirect(
            new URL(ROUTES.TEACHER.DASHBOARD, request.url)
          );
        }
      }
    }
    return NextResponse.next();
  }

  // Get tokens and role information from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const userRolesStr = request.cookies.get('user_roles')?.value;
  const activeRole = request.cookies.get('active_role')?.value;
  const fallbackRole = request.cookies.get('user_role')?.value; // Backward compatibility

  // Parse user roles
  let userRoles: ('STUDENT' | 'TEACHER')[] = [];
  if (userRolesStr) {
    try {
      userRoles = JSON.parse(userRolesStr);
    } catch {
      userRoles = [];
    }
  }

  // If no user_roles but has fallback user_role, use that
  if (userRoles.length === 0 && fallbackRole) {
    userRoles = [fallbackRole as 'STUDENT' | 'TEACHER'];
  }

  const currentRole = activeRole || fallbackRole;

  if (!accessToken) {
    // Redirect to login if no token
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Handle case where user has token but no roles yet.
  // This happens right after email-verification or OAuth when the callback
  // page has stored the access_token cookie but the auth context hasn't
  // had a chance to fetch the profile and persist the role cookies.
  //
  // ⚠️  Do NOT redirect to sign-in here when pathname is '/':
  //   sign-in sees isAuthenticated=true → does window.location.replace('/')
  //   → middleware redirects back to sign-in → infinite loop.
  //
  // Instead, let '/' through.  The client-side AuthContext will fetch the
  // profile, set role cookies, and page.tsx will route to the dashboard.
  if (userRoles.length === 0) {
    if (pathname === '/') {
      return NextResponse.next();
    }
    // For any other protected path redirect to sign-in with the redirect param
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle root path - redirect based on active role or first available role
  if (pathname === '/') {
    // Prioritize TEACHER if available in roles, unless we have a specific active role
    const hasTeacher = userRoles.includes('TEACHER');
    const roleToUse = currentRole || (hasTeacher ? 'TEACHER' : userRoles[0]);

    if (roleToUse === 'TEACHER') {
      return NextResponse.redirect(
        new URL(ROUTES.TEACHER.DASHBOARD, request.url)
      );
    } else if (roleToUse === 'STUDENT') {
      return NextResponse.redirect(
        new URL(ROUTES.STUDENT.DASHBOARD, request.url)
      );
    }
  }

  // Check role-based access for protected routes with multi-role support
  const isStudentRoute = STUDENT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isTeacherRoute = TEACHER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isStudentRoute) {
    // Allow access if user has student role
    if (!userRoles.includes('STUDENT')) {
      // User doesn't have student role, redirect to their default dashboard
      const roleToUse = currentRole || userRoles[0];
      if (roleToUse === 'TEACHER') {
        return NextResponse.redirect(
          new URL(ROUTES.TEACHER.DASHBOARD, request.url)
        );
      } else {
        // No valid role, redirect to login
        const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  } else if (isTeacherRoute) {
    // Allow access if user has teacher role
    if (!userRoles.includes('TEACHER')) {
      // User doesn't have teacher role, redirect to their default dashboard
      const roleToUse = currentRole || userRoles[0];
      if (roleToUse === 'STUDENT') {
        return NextResponse.redirect(
          new URL(ROUTES.STUDENT.DASHBOARD, request.url)
        );
      } else {
        // No valid role, redirect to login
        const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  } else {
    // Route not recognized, redirect to default dashboard
    const roleToUse = currentRole || userRoles[0];
    if (roleToUse === 'STUDENT') {
      return NextResponse.redirect(
        new URL(ROUTES.STUDENT.DASHBOARD, request.url)
      );
    } else if (roleToUse === 'TEACHER') {
      return NextResponse.redirect(
        new URL(ROUTES.TEACHER.DASHBOARD, request.url)
      );
    } else {
      // No valid role, redirect to login
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
