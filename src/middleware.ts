import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes for each role
const STUDENT_ROUTES = [
  '/student',
  '/student/dashboard',
  '/student/teachers',
  '/student/ai-tutor',
  '/student/ai-chirologist',
  '/student/chat',
  '/student/meetings',
  '/student/history',
  '/student/session-report',
  '/student/settings',
];

const TEACHER_ROUTES = [
  '/teacher',
  '/teacher/dashboard',
  '/teacher/chat',
  '/teacher/meetings',
  '/teacher/services',
  '/teacher/settings',
];

const PUBLIC_ROUTES = [
  '/auth/sign-in',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/language',
  '/astrology',
  '/ai-session',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  if (!accessToken || !userRole) {
    // Redirect to login if no token or role
    const loginUrl = new URL('/auth/sign-in', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Handle root path - redirect based on role
  if (pathname === '/') {
    if (userRole === 'STUDENT') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    } else if (userRole === 'TEACHER') {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    }
  }

  // Check role-based access for protected routes
  if (userRole === 'STUDENT') {
    const isStudentRoute = STUDENT_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    if (!isStudentRoute) {
      // Redirect student to their dashboard if trying to access teacher routes
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  } else if (userRole === 'TEACHER') {
    const isTeacherRoute = TEACHER_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    if (!isTeacherRoute) {
      // Redirect teacher to their dashboard if trying to access student routes
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    }
  } else {
    // Invalid role, redirect to login
    const loginUrl = new URL('/auth/sign-in', request.url);
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
