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

  // Create the final response based on logic
  let finalResponse: NextResponse;

  // New user without a role → choose their role before accessing the app
  if (requiresRoleSelection) {
    finalResponse = NextResponse.redirect(`${origin}${ROUTES.ONBOARDING.CHOOSE_ROLE}`);
  } else {
    // Handle load balancers (production)
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
      finalResponse = NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      finalResponse = NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      finalResponse = NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Clean up the intended_role cookie
  if (intendedRoleCookie) {
    finalResponse.cookies.delete('intended_role');
  }

  return finalResponse;
}
