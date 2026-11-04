import { NextRequest, NextResponse } from 'next/server';

import { authActions, type AuthAction, type SessionSnapshot } from '@/lib/auth-actions';
import { clearRoleCookies, writeRoleCookies } from '@/lib/auth-cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ACTIONS = Object.keys(authActions) as AuthAction[];

/** URLs are kebab-case (`/api/auth/sync-roles`), keys are camelCase (`syncRoles`). */
function resolveAction(name: string): AuthAction | null {
  const normalized = name.replace(/-/g, '').toLowerCase();
  return ACTIONS.find((action) => action.replace(/-/g, '').toLowerCase() === normalized) ?? null;
}

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * All Supabase auth happens here so tokens and the session cookie stay
 * server-side. Responses are never cacheable — they set auth cookies.
 */
async function handle(
  request: NextRequest,
  action: AuthAction,
  body: Record<string, unknown>
) {
  const run = authActions[action] as unknown as (
    ...args: unknown[]
  ) => Promise<SessionSnapshot>;

  let result: SessionSnapshot;
  try {
    result = await run(request, body);
  } catch (err) {
    // A crash must still answer as JSON: the client parses every auth reply,
    // and a half-resolved snapshot would overwrite good role cookies with none.
    console.error(`[auth] ${action} failed:`, err);
    result = {
      status: 500,
      error: 'Something went wrong. Please try again.',
      isAuthenticated: false,
      userRoles: [],
      activeRole: null,
      rolesUnknown: true,
    };
  }

  const response = NextResponse.json(result, {
    status: result.status ?? 200,
    headers: NO_STORE,
  });

  // Roles are written only when the server actually resolved them. Leaving the
  // cookies untouched on a failed lookup keeps "unknown" distinct from "roleless".
  if (result.isAuthenticated && !result.rolesUnknown) {
    writeRoleCookies(response, result.userRoles, result.activeRole);
  } else if (action === 'logout' || result.status === 401) {
    clearRoleCookies(response);
  }

  if (action === 'googleOAuthStart' && result.redirectTo) {
    response.cookies.set('oauth_redirect', result.redirectTo, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10,
    });
  }

  return response;
}

type RouteContext = { params: Promise<{ action: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { action } = await context.params;
  const name = resolveAction(action);
  if (name !== 'session') {
    return Response.json({ error: 'Not found' }, { status: 404, headers: NO_STORE });
  }
  return handle(request, name, {});
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { action } = await context.params;
  const name = resolveAction(action);
  if (!name) {
    return Response.json({ error: 'Not found' }, { status: 404, headers: NO_STORE });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  return handle(request, name, body);
}
