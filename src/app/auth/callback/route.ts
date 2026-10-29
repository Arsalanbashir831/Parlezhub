import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants/routes';
import { API_ROUTES } from '@/constants/api-routes';
import {
  pickActiveRole,
  rolesFromProfileFlags,
  writeRoleCookies,
} from '@/lib/auth-cookies';
import type { UserRole } from '@/types/user';

/** Only allow same-site absolute paths as post-login destinations. */
function safeRedirect(value: string | undefined | null): string {
  if (!value) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

/**
 * Auth Callback Route Handler — handles PKCE code exchange for:
 *  - Email/password signup (after email verification click)
 *  - Google OAuth redirect
 *  - Magic link (future)
 *
 * Supabase redirects here with a `code` query param.
 * We exchange it for a session → @supabase/ssr stores it in HTTP-only cookies.
 * Then we call Django /api/auth/sync/ to create/sync the local user record.
 * If new user has no role yet, redirect to /onboarding/choose-role.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  const oauthRedirectCookie = request.cookies.get('oauth_redirect')?.value;
  const next = safeRedirect(oauthRedirectCookie || searchParams.get('next'));

  if (!code) {
    console.error('[auth/callback] No code param received');
    return NextResponse.redirect(`${origin}${ROUTES.AUTH.AUTH_CODE_ERROR}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error('[auth/callback] Code exchange failed:', error?.message);
    return NextResponse.redirect(`${origin}${ROUTES.AUTH.AUTH_CODE_ERROR}`);
  }

  const accessToken = data.session.access_token;
  const isRecovery = searchParams.get('type') === 'recovery';

  // Password reset flow — the recovery session already lives in httpOnly
  // cookies, so no credential is put in the URL (it would land in history
  // and server logs). /auth/reset-password acts on the session directly.
  if (isRecovery) {
    return NextResponse.redirect(`${origin}${ROUTES.AUTH.RESET_PASSWORD}`);
  }

  // Read intended_role cookie (set by GoogleOAuthButton for new signups)
  const intendedRoleCookie = request.cookies.get('intended_role')?.value;

  // Sync user to Django (idempotent — safe to call on every login)
  let requiresRoleSelection = false;
  try {
    const syncRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.SYNC}`,
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
      console.error('[auth/callback] Sync failed:', await syncRes.text());
    }
  } catch (syncErr) {
    console.error('[auth/callback] Sync request error:', syncErr);
    // Don't block login on sync errors — the user is authenticated
  }

  // Create the final response
  let finalResponse: NextResponse;
  const targetUrl = requiresRoleSelection
    ? `${origin}${ROUTES.ONBOARDING.CHOOSE_ROLE}`
    : `${origin}${next}`;

  // Handle load balancers (production)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    finalResponse = NextResponse.redirect(targetUrl);
  } else if (forwardedHost) {
    finalResponse = NextResponse.redirect(`https://${forwardedHost}${new URL(targetUrl).pathname}${new URL(targetUrl).search}`);
  } else {
    finalResponse = NextResponse.redirect(targetUrl);
  }

  // ── SET ROLE COOKIES ──────────────────────────────────────────────────────
  // We MUST set these cookies on the server side so the first request
  // to the dashboard (which goes through middleware) has them. They are
  // httpOnly: role decisions are the server's, not something JS can forge.
  try {
    const rolesRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.ME}`,
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
    console.error('[auth/callback] Failed to fetch roles for cookie setup:', rolesErr);
  }

  // Clean up the intended_role cookie
  if (intendedRoleCookie) {
    finalResponse.cookies.delete('intended_role');
  }
  // Clean up the oauth_redirect cookie
  if (oauthRedirectCookie) {
    finalResponse.cookies.delete('oauth_redirect');
  }

  return finalResponse;
}
