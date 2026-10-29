import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

import { API_ROUTES } from '@/constants/api-routes';
import { ROUTES } from '@/constants/routes';
import {
  fetchRoles,
  pickActiveRole,
  readRoleCookies,
} from '@/lib/auth-cookies';
import { createClient, getValidAccessToken } from '@/lib/supabase/server';
import type { UserRole } from '@/types/user';
import type { SessionSnapshot as ClientSessionSnapshot } from '@/types/auth';

/** Server-side result; `status`/`error` are turned into the HTTP response. */
export interface SessionSnapshot extends ClientSessionSnapshot {
  status?: number;
  error?: string;
}

function failure(status: number, error: string): SessionSnapshot {
  return { status, error, isAuthenticated: false, userRoles: [], activeRole: null };
}

function getOrigin(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost) return `https://${forwardedHost.split(',')[0].trim()}`;
  }
  return new URL(request.url).origin;
}

/**
 * Django creates/updates its local user row from the verified Supabase identity.
 * Idempotent, and must complete before any profile read or the roles endpoint 404s.
 */
async function syncUserToBackend(accessToken: string, role?: UserRole) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.SYNC}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      // The backend validates the credential through the Supabase admin client,
      // so the token travels in the body as well as the header. Both come from
      // this server process — the browser never sees them.
      body: JSON.stringify({ access_token: accessToken, ...(role ? { role } : {}) }),
    }
  );

  if (!res.ok) {
    throw new Error(`Backend sync failed (${res.status})`);
  }
  return (await res.json()) as { requires_role_selection?: boolean };
}

async function snapshot(
  accessToken: string,
  currentActive?: UserRole | null
): Promise<SessionSnapshot> {
  let userRoles: UserRole[] = [];
  let rolesUnknown = false;
  try {
    userRoles = await fetchRoles(accessToken);
  } catch (err) {
    console.error('[auth] role lookup failed:', err);
    rolesUnknown = true;
  }
  const stored = currentActive ?? readRoleCookies(await cookies()).activeRole;
  return {
    isAuthenticated: true,
    userRoles,
    activeRole: pickActiveRole(userRoles, stored),
    ...(rolesUnknown ? { rolesUnknown: true } : {}),
  };
}

export const authActions = {
  async login(_request: NextRequest, body: { email?: string; password?: string }) {
    if (!body.email || !body.password) {
      return failure(400, 'Email and password are required');
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error) return failure(401, error.message);
    if (!data.session) return failure(401, 'No session returned');

    // Django knows whether the profile still needs a role; carrying that answer
    // forward saves the client a second lookup before showing the picker.
    let requiresRoleSelection = false;
    try {
      const sync = await syncUserToBackend(data.session.access_token);
      requiresRoleSelection = sync.requires_role_selection === true;
    } catch (err) {
      console.error('[auth] login sync failed:', err);
    }

    const result = await snapshot(data.session.access_token);
    return requiresRoleSelection ? { ...result, requiresRoleSelection } : result;
  },

  async signup(request: NextRequest, body: { email?: string; password?: string; full_name?: string }) {
    if (!body.email || !body.password) {
      return failure(400, 'Email and password are required');
    }

    const supabase = await createClient();
    const [first = '', ...rest] = (body.full_name ?? '').trim().split(' ');
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.full_name ?? '',
          first_name: first,
          last_name: rest.join(' '),
        },
        emailRedirectTo: `${getOrigin(request)}${ROUTES.AUTH.CALLBACK}`,
      },
    });

    if (error) return failure(400, error.message);

    return {
      isAuthenticated: false,
      userRoles: [],
      activeRole: null,
      email: body.email,
      // With confirmation required there is no session until the link is clicked.
      needsVerification: !data.session,
    } satisfies SessionSnapshot;
  },

  async logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { isAuthenticated: false, userRoles: [], activeRole: null };
  },

  /** Current session for the client: verified user plus server-held roles. */
  async session() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { isAuthenticated: false, userRoles: [], activeRole: null };
    }

    const { userRoles, activeRole } = readRoleCookies(await cookies());
    if (userRoles.length > 0) {
      return { isAuthenticated: true, userRoles, activeRole };
    }

    const accessToken = await getValidAccessToken(supabase);
    if (!accessToken) return failure(401, 'Session expired');
    return snapshot(accessToken, activeRole);
  },

  /** Re-reads roles from Django and writes them into the role cookies. */
  async syncRoles() {
    const supabase = await createClient();
    const accessToken = await getValidAccessToken(supabase);
    if (!accessToken) return failure(401, 'Session expired');
    return snapshot(accessToken);
  },

  async activeRole(_request: NextRequest, body: { role?: UserRole }) {
    const supabase = await createClient();
    const accessToken = await getValidAccessToken(supabase);
    if (!accessToken) return failure(401, 'Session expired');

    const roles = await fetchRoles(accessToken);
    if (!body.role || !roles.includes(body.role)) {
      return failure(403, `You don't have access to ${body.role} role`);
    }

    return { isAuthenticated: true, userRoles: roles, activeRole: body.role };
  },

  async forgotPassword(request: NextRequest, body: { email?: string }) {
    if (!body.email) return failure(400, 'Email is required');
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
      redirectTo: `${getOrigin(request)}${ROUTES.AUTH.RESET_PASSWORD}`,
    });
    if (error) return failure(400, error.message);
    return { isAuthenticated: false, userRoles: [], activeRole: null };
  },

  /** Completes a password reset on a live recovery session (token never touches the URL). */
  async resetPassword(_request: NextRequest, body: { password?: string }) {
    if (!body.password || body.password.length < 6) {
      return failure(400, 'Password must be at least 6 characters');
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) return failure(400, error.message);
    return { isAuthenticated: false, userRoles: [], activeRole: null };
  },

  async resendVerification(request: NextRequest, body: { email?: string }) {
    if (!body.email) return failure(400, 'Email is required');
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: body.email,
      options: { emailRedirectTo: `${getOrigin(request)}${ROUTES.AUTH.CALLBACK}` },
    });
    if (error) return failure(400, error.message);
    return { isAuthenticated: false, userRoles: [], activeRole: null };
  },

  async exchangeCode(body: { code?: string }) {
    if (!body.code) return failure(400, 'Missing authorization code');
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(body.code);
    if (error || !data.session) return failure(401, 'Could not exchange the sign-in link');
    return snapshot(data.session.access_token);
  },

  async changePassword(
    _request: NextRequest,
    body: { current_password?: string; new_password?: string }
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return failure(401, 'Could not find authenticated user');

    // Re-authenticating proves ownership of the account before updateUser.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.current_password ?? '',
    });
    if (signInError) return failure(401, 'Current password is incorrect.');

    const { error } = await supabase.auth.updateUser({
      password: body.new_password ?? '',
    });
    if (error) return failure(400, error.message);

    return { isAuthenticated: false, userRoles: [], activeRole: null };
  },

  async googleOAuthStart(request: NextRequest, body: { redirectTo?: string }) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getOrigin(request)}${ROUTES.AUTH.CALLBACK}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) return failure(400, error.message);

    return {
      isAuthenticated: false,
      userRoles: [],
      activeRole: null,
      url: data.url,
      redirectTo: body.redirectTo,
    } satisfies SessionSnapshot;
  },

  /** Google One Tap: exchange the ID token server-side, then sync and resolve roles. */
  async googleIdToken(
    _request: NextRequest,
    body: { credential?: string; nonce?: string; role?: UserRole }
  ) {
    if (!body.credential) return failure(400, 'Missing Google credential');

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: body.credential,
      nonce: body.nonce,
    });
    if (error) return failure(401, error.message);
    if (!data.session) return failure(401, 'No session returned');

    let requiresRoleSelection = false;
    try {
      const sync = await syncUserToBackend(data.session.access_token, body.role);
      requiresRoleSelection = sync.requires_role_selection === true;
    } catch (err) {
      console.error('[auth] Google sync failed:', err);
      return { ...failure(502, 'Could not sync your account'), requiresRoleSelection: true };
    }

    const result = await snapshot(data.session.access_token);
    return { ...result, requiresRoleSelection };
  },

  /**
   * Short-lived credential for the chat WebSocket. Channels authenticates the
   * handshake, which a Next.js route handler cannot proxy, so the token has to
   * reach the browser. It is fetched per connection and never persisted.
   */
  async wsToken() {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return failure(401, 'Session expired');
    return {
      isAuthenticated: true,
      userRoles: [],
      activeRole: null,
      // This action says nothing about roles; the route handler must leave the
      // role cookies exactly as they are.
      rolesUnknown: true,
      token: accessToken,
    };
  },
};

export type AuthAction = keyof typeof authActions;
