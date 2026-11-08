/**
 * The sub-applications this project hosts. Each lives under its own path prefix
 * (src/app/<id>) with its own theme and UI, and shares one integration: the
 * same Supabase accounts, the same Django roles (STUDENT / TEACHER), the same
 * auth API and session cookies. Anything that needs "which app am I in" asks
 * here, so adding an app is one entry in APPS.
 *
 * Kept free of React and Next imports: proxy.ts, route handlers, server
 * actions and client code all use it.
 */

export const APP_IDS = ['astrology', 'parlezhub'] as const;
export type AppId = (typeof APP_IDS)[number];

export interface AppDefinition {
  id: AppId;
  /** Product name shown in UI copy and page titles. */
  name: string;
  /** Path prefix every route of the app lives under. */
  basePath: `/${string}`;
  /** Where a signed-in user with a role lands. */
  home: string;
  /** What the two roles are called in this app's UI. */
  roleLabels: { STUDENT: string; TEACHER: string };
}

export const APPS: Record<AppId, AppDefinition> = {
  astrology: {
    id: 'astrology',
    name: 'Shakti Wheel',
    basePath: '/astrology',
    home: '/astrology',
    roleLabels: { STUDENT: 'End User', TEACHER: 'Astrologer' },
  },
  parlezhub: {
    id: 'parlezhub',
    name: 'ParlezHub',
    basePath: '/parlezhub',
    home: '/parlezhub',
    roleLabels: { STUDENT: 'Learner', TEACHER: 'Language Consultant' },
  },
};

/** The app "/" and any path outside every app's prefix belong to. */
export const DEFAULT_APP: AppId = 'astrology';

export const isAppId = (value: unknown): value is AppId =>
  typeof value === 'string' && (APP_IDS as readonly string[]).includes(value);

const underPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** The app a path belongs to, by its prefix; DEFAULT_APP otherwise. */
export function appFromPath(pathname: string | null | undefined): AppId {
  if (!pathname) return DEFAULT_APP;
  return (
    APP_IDS.find((id) => underPrefix(pathname, APPS[id].basePath)) ??
    DEFAULT_APP
  );
}

/** Every URL the shared auth and onboarding flow needs, for one app. */
export function authRoutes(app: AppId) {
  const base = APPS[app].basePath;
  return {
    home: APPS[app].home,
    /** Prefix of every public (signed-out) page of this app. */
    authBase: `${base}/auth`,
    login: `${base}/auth/sign-in`,
    signup: `${base}/auth/signup`,
    forgotPassword: `${base}/auth/forgot-password`,
    resetPassword: `${base}/auth/reset-password`,
    verifyEmail: `${base}/auth/verify-email`,
    authCodeError: `${base}/auth/auth-code-error`,
    /** Supabase redirect target; must be in the project's redirect allow-list. */
    callback: `${base}/auth/callback`,
    onboarding: `${base}/onboarding`,
  } as const;
}

export type AuthRoutes = ReturnType<typeof authRoutes>;

/**
 * Which app an in-flight Google sign-in started from (httpOnly, 10 minutes).
 * Supabase sends a sign-in to its Site URL ("/") when it rejects the app's
 * callback; this lets "/" hand the code to the right app instead of the default.
 */
export const AUTH_APP_COOKIE = 'auth_app';

/** True for any app's public auth pages (sign-in, signup, callback, ...). */
export const isAuthPath = (pathname: string) =>
  APP_IDS.some((id) => underPrefix(pathname, authRoutes(id).authBase));

/** True for any app's onboarding (role picker) page. */
export const isOnboardingPath = (pathname: string) =>
  APP_IDS.some((id) => underPrefix(pathname, authRoutes(id).onboarding));
