export type AuthRole = 'STUDENT' | 'TEACHER' | 'BOTH';

/**
 * What `/api/auth/*` returns to the client. Roles are computed by the server
 * from the backend profile; the browser only ever receives the result.
 */
export interface SessionSnapshot {
  isAuthenticated: boolean;
  userRoles: AuthRole[];
  activeRole: AuthRole | null;
  /**
   * True when the role lookup failed, so `userRoles: []` means "unknown" rather
   * than "roleless". Unknown roles must not overwrite the role cookies, otherwise
   * a returning user is bounced to onboarding until the next session read.
   */
  rolesUnknown?: boolean;
  requiresRoleSelection?: boolean;
  /** WebSocket credential only. */
  token?: string;
  url?: string;
  redirectTo?: string;
  email?: string;
  needsVerification?: boolean;
}
