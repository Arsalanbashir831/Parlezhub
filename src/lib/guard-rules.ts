import { APPS, DEFAULT_APP, appFromPath, authRoutes, type AppId } from '@/lib/apps';

import type { SessionSnapshot } from '@/types/auth';
import type { UserRole } from '@/types/user';

export interface GuardInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  userRoles: UserRole[];
  activeRole: UserRole | null;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  canAccessRole: (role: UserRole) => boolean;
  pathname: string;
  search: string;
  /** True while the server has not resolved roles for this session. */
  rolesUnknown?: boolean;
}

export interface GuardDecision {
  /** Show the auth-pending spinner instead of deciding on stale data. */
  pending: boolean;
  /** Where to navigate, or null to stay put. */
  redirect: string | null;
  /** Whether the protected children may render. */
  render: boolean;
}

/**
 * Where a signed-in user with a role belongs in an app: its home, whatever the
 * role (each app is one workspace for both roles). Shared with proxy.ts so the
 * server and client can never disagree.
 */
export const homePath = (app: AppId = DEFAULT_APP): string => APPS[app].home;

/** Home of the default app, which "/" and retired URLs fall back to. */
export const HOME_PATH = homePath(DEFAULT_APP);

/** The dashboard for a role in an app. Both roles share one home today. */
export function dashboardFor(
  role: UserRole | null | undefined,
  app: AppId = DEFAULT_APP
): string {
  void role;
  return homePath(app);
}

/**
 * True while a snapshot still leaves the roles open to a better answer: either
 * the lookup failed, or it came back empty and Django has not explicitly asked
 * for a role to be chosen. Roles can lag the profile row right after sign-in, so
 * a re-check beats showing the picker to somebody who already has a role.
 */
export function rolesNeedRecheck(snapshot: SessionSnapshot): boolean {
  if (!snapshot.isAuthenticated || snapshot.requiresRoleSelection === true) {
    return false;
  }
  return snapshot.rolesUnknown === true || snapshot.userRoles.length === 0;
}

/**
 * Where a freshly authenticated session belongs: the page it came for, else
 * onboarding when it has no role, else home. Decided from resolved roles only,
 * so nobody is routed through the picker on the way to the workspace they own.
 */
export function landingPathFor(
  snapshot: SessionSnapshot,
  redirectTo?: string | null,
  app: AppId = DEFAULT_APP
): string {
  // Authentication always lands on the app's home. Protected deep links can
  // still be opened after the role/session has been resolved.
  void redirectTo;
  if (snapshot.userRoles.length === 0) return authRoutes(app).onboarding;
  return homePath(app);
}

/**
 * Single source of truth for client-side route protection, mirroring the rules
 * proxy.ts applies on the server. Kept free of React so both are testable.
 */
export function evaluateRoleGuard(input: GuardInput): GuardDecision {
  if (input.isLoading) {
    return { pending: true, redirect: null, render: false };
  }

  // The guarded page's own app decides where sign-in and onboarding are.
  const app = appFromPath(input.pathname);

  if (!input.isAuthenticated) {
    const current = input.pathname + input.search;
    return {
      pending: false,
      redirect: `${authRoutes(app).login}?redirect=${encodeURIComponent(current)}`,
      render: false,
    };
  }

  const allowed = input.allowedRoles.some((role) => input.canAccessRole(role));
  if (allowed) {
    return { pending: false, redirect: null, render: true };
  }

  // No roles to judge yet. Sign-in is the wrong answer here — the session is
  // live, and bouncing it would loop through the login page until a refresh.
  if (input.userRoles.length === 0) {
    return {
      pending: input.rolesUnknown !== false,
      redirect:
        input.rolesUnknown === false ? authRoutes(app).onboarding : null,
      render: false,
    };
  }

  // Logged in but not for this screen: send them to their own dashboard.
  return {
    pending: false,
    redirect:
      input.fallbackPath ??
      dashboardFor(input.activeRole ?? input.userRoles[0], app),
    render: false,
  };
}
