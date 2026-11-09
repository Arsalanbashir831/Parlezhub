import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { API_ROUTES } from '@/constants/api-routes';
import {
  APPS,
  AUTH_APP_COOKIE,
  appFromPath,
  authRoutes,
  type AppId,
} from '@/lib/apps';
import { publicOrigin } from '@/lib/request-origin';
import {
  pickActiveRole,
  rolesFromProfileFlags,
  writeRoleCookies,
} from '@/lib/auth-cookies';
import type { UserRole } from '@/types/user';

/**
 * The post-login destination, if it is a same-site path inside this app.
 * Anything else — another site, another app's page, "/" — falls back to the
 * app's home, so a destination saved by some other sign-in can never carry a
 * ParlezHub sign-in into Shakti Wheel (or the reverse).
 */
function safeRedirect(
  value: string | undefined | null,
  app: AppId,
  fallback: string
): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  if (appFromPath(value) !== app || !value.startsWith(APPS[app].basePath)) {
    return fallback;
  }
  return value;
}

/** The handoff cookies a sign-in leaves behind; cleared on every outcome. */
function redirectAndClear(url: string, request: NextRequest) {
  const response = NextResponse.redirect(url);
  for (const name of ['oauth_redirect', 'intended_role', AUTH_APP_COOKIE]) {
    if (request.cookies.has(name)) response.cookies.delete(name);
  }
  return response;
}

/**
 * Supabase auth callback, shared by every app — each app's
 * `<app>/auth/callback/route.ts` calls this with its own id. Handles the PKCE
 * code exchange for:
 *  - Email/password signup (after email verification click)
 *  - Google OAuth redirect
 *  - Password recovery links
 *
 * Supabase redirects here with a `code` query param.
 * We exchange it for a session → @supabase/ssr stores it in HTTP-only cookies.
 * Then we call Django /api/auth/sync/ to create/sync the local user record.
 * Every redirect stays inside the app the link was issued for: a new user
 * without a role goes to that app's onboarding.
 */
export async function handleAuthCallback(request: NextRequest, app: AppId) {
  const routes = authRoutes(app);
  const { searchParams } = new URL(request.url);
  // Every redirect below — errors included — must use the public origin: in
  // production request.url is the container's http://0.0.0.0:3000.
  const origin = publicOrigin(request);
  const code = searchParams.get('code');

  const oauthRedirectCookie = request.cookies.get('oauth_redirect')?.value;
  const next = safeRedirect(
    oauthRedirectCookie || searchParams.get('next'),
    app,
    routes.home
  );

  if (!code) {
    console.error(`[${app}/auth/callback] No code param received`);
    return redirectAndClear(`${origin}${routes.authCodeError}`, request);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error(`[${app}/auth/callback] Code exchange failed:`, error?.message);
    return redirectAndClear(`${origin}${routes.authCodeError}`, request);
  }

  const accessToken = data.session.access_token;
  const isRecovery = searchParams.get('type') === 'recovery';

  // Password reset flow — the recovery session already lives in httpOnly
  // cookies, so no credential is put in the URL (it would land in history
  // and server logs). The reset-password page acts on the session directly.
  if (isRecovery) {
    return redirectAndClear(`${origin}${routes.resetPassword}`, request);
  }

  // Read intended_role cookie (set by GoogleOAuthButton for new signups)
  const intendedRoleCookie = request.cookies.get('intended_role')?.value;

  // Sync user to Django (idempotent — safe to call on every login)
  let requiresRoleSelection = false;
  try {
    const syncRes = await fetch(
      `${process.env.BACKEND_URL}${API_ROUTES.AUTH.SYNC}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
          ...(intendedRoleCookie ? { role: intendedRoleCookie } : {})
        }),
      }
    );

    if (syncRes.ok) {
      const syncData = await syncRes.json();
      requiresRoleSelection = syncData.requires_role_selection === true;
    } else {
      console.error(`[${app}/auth/callback] Sync failed:`, await syncRes.text());
    }
  } catch (syncErr) {
    console.error(`[${app}/auth/callback] Sync request error:`, syncErr);
    // Don't block login on sync errors — the user is authenticated
  }

  // Create the final response
  const targetUrl = requiresRoleSelection
    ? `${origin}${routes.onboarding}`
    : `${origin}${next}`;
  const finalResponse = redirectAndClear(targetUrl, request);

  // ── SET ROLE COOKIES ──────────────────────────────────────────────────────
  // We MUST set these cookies on the server side so the first request
  // to the dashboard (which goes through middleware) has them. They are
  // httpOnly: role decisions are the server's, not something JS can forge.
  try {
    const rolesRes = await fetch(
      `${process.env.BACKEND_URL}${API_ROUTES.AUTH.ME}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    if (rolesRes.ok) {
      const rolesData = await rolesRes.json();
      const availableRoles: UserRole[] = rolesFromProfileFlags(rolesData);
      if (availableRoles.length > 0) {
        writeRoleCookies(
          finalResponse,
          availableRoles,
          pickActiveRole(availableRoles)
        );
      }
    }
  } catch (rolesErr) {
    console.error(`[${app}/auth/callback] Failed to fetch roles for cookie setup:`, rolesErr);
  }

  return finalResponse;
}
