import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ROUTES } from './constants/routes';

// Define protected routes for each role
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
      const userRole = request.cookies.get('user_role')?.value;
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (accessToken && userRole) {
        // If a redirect param is present, honor it instead of forcing dashboard
        if (redirectParam) {
          return NextResponse.redirect(new URL(redirectParam, request.url));
        }
        if (userRole === 'STUDENT') {
          return NextResponse.redirect(
            new URL(ROUTES.STUDENT.DASHBOARD, request.url)
          );
        }
        if (userRole === 'TEACHER') {
          return NextResponse.redirect(
            new URL(ROUTES.TEACHER.DASHBOARD, request.url)
          );
        }
      }
    }
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  if (!accessToken) {
    // Redirect to login if no token
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Handle case where user has token but no role (incomplete OAuth flow)
  if (!userRole) {
    // Redirect to login - OAuth callback will handle role selection inline
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Handle root path - redirect based on role
  if (pathname === '/') {
    if (userRole === 'STUDENT') {
      return NextResponse.redirect(
        new URL(ROUTES.STUDENT.DASHBOARD, request.url)
      );
    } else if (userRole === 'TEACHER') {
      return NextResponse.redirect(
        new URL(ROUTES.TEACHER.DASHBOARD, request.url)
      );
    }
  }

  // Check role-based access for protected routes
  if (userRole === 'STUDENT') {
    const isStudentRoute = STUDENT_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    if (!isStudentRoute) {
      // Redirect student to their dashboard if trying to access teacher routes
      return NextResponse.redirect(
        new URL(ROUTES.STUDENT.DASHBOARD, request.url)
      );
    }
  } else if (userRole === 'TEACHER') {
    const isTeacherRoute = TEACHER_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    if (!isTeacherRoute) {
      // Redirect teacher to their dashboard if trying to access student routes
      return NextResponse.redirect(
        new URL(ROUTES.TEACHER.DASHBOARD, request.url)
      );
    }
  } else {
    // Invalid role, redirect to login
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
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
