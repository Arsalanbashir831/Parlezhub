import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { ROUTES } from '@/constants/routes';
import { API_ROUTES } from '@/constants/api-routes';

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
  const next = searchParams.get('next') ?? '/';

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
  const isRecovery = data.session.user?.app_metadata?.provider === undefined
    ? false
    : searchParams.get('type') === 'recovery';

  // Password reset flow — skip sync, go straight to reset page
  if (isRecovery) {
    const resetUrl = new URL(ROUTES.AUTH.RESET_PASSWORD, origin);
    resetUrl.searchParams.set('token', accessToken);
    return NextResponse.redirect(resetUrl.toString());
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
  // to the dashboard (which goes through middleware) has them.
  try {
    const rolesRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.AUTH.ME}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (rolesRes.ok) {
      const rolesData = await rolesRes.json();
      const availableRoles: string[] = [];
      if (rolesData.has_teacher) availableRoles.push('TEACHER');
      if (rolesData.has_student) availableRoles.push('STUDENT');

      if (availableRoles.length > 0) {
        // Set user_roles (plural) as JSON array
        finalResponse.cookies.set('user_roles', JSON.stringify(availableRoles), { 
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax'
        });

        // Set active_role (default to first role)
        const defaultRole = availableRoles[0];
        finalResponse.cookies.set('active_role', defaultRole, { 
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax'
        });
      }
    }
  } catch (rolesErr) {
    console.error('[auth/callback] Failed to fetch roles for cookie setup:', rolesErr);
  }

  // Clean up the intended_role cookie
  if (intendedRoleCookie) {
    finalResponse.cookies.delete('intended_role');
  }

  return finalResponse;
}
