import type { NextRequest } from 'next/server';

import { clearRoleCookies } from '@/lib/auth-cookies';
import { createClient, getValidAccessToken } from '@/lib/supabase/server';

export type GatewayTarget = 'backend' | 'chat';

const BASE_URLS: Record<GatewayTarget, () => string | undefined> = {
  backend: () => process.env.NEXT_PUBLIC_BACKEND_URL,
  chat: () => process.env.NEXT_PUBLIC_CHAT_SERVER_URL,
};

// Response headers worth mirroring; everything else (content-length,
// content-encoding, transfer-encoding) belongs to the hop we are terminating.
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-disposition',
  'location',
  'refresh',
];

async function forceRefresh(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (error) return null;
    return data?.session?.access_token ?? null;
  } catch (err) {
    console.error('[Gateway] Session refresh threw:', err);
    return null;
  }
}

/**
 * Same-origin proxy in front of the Django API and the chat server.
 *
 * The browser never sees an access token: it calls /api/backend/... with its
 * httpOnly session cookie, and this module attaches `Authorization: Bearer`
 * server-side. The request body is buffered so FormData, uploads and JSON all
 * pass through unchanged.
 *
 * `X-Gateway-No-Auth: 1` forwards without credentials, for public endpoints
 * that must not be affected by a stale token.
 */
/**
 * Next strips trailing slashes from every URL it serves, including API routes, so
 * `/api/backend/auth/set-role/` never reaches this handler — it 308s to the
 * slashless form, and Django then rejects the slashless path. The client therefore
 * sends the exact upstream path in a header; the URL stays readable for logs.
 */
function sanitizeUpstreamPath(header: string | null): string | null {
  if (!header || !header.startsWith('/')) return null;
  // A query, fragment or backslash would let the value escape the path we append
  // to the upstream base; control characters and whitespace break the request.
  if (/[?#\\\s\u0000-\u001f]/.test(header)) return null;
  if (header.split('/').some((segment) => segment === '.' || segment === '..')) {
    return null;
  }
  return header;
}

export async function forwardToUpstream(
  request: NextRequest,
  target: GatewayTarget,
  urlSegments: string[]
): Promise<Response> {
  const base = BASE_URLS[target]?.();
  if (!base) {
    return Response.json(
      { error: `${target} upstream is not configured` },
      { status: 500 }
    );
  }

  const path =
    sanitizeUpstreamPath(request.headers.get('x-upstream-path')) ??
    `/${urlSegments
      .filter((segment) => segment !== '.' && segment !== '..')
      .join('/')}`;

  const trimmedBase = base.replace(/\/$/, '');
  const upstreamBase = new URL(trimmedBase);
  const upstreamBasePath = upstreamBase.pathname.replace(/\/$/, '');

  const omitCredentials = request.headers.get('x-gateway-no-auth') === '1';
  const accessToken = omitCredentials ? null : await getValidAccessToken();

  const upstreamUrl = `${trimmedBase}${path}${request.nextUrl.search}`;

  const method = request.method.toUpperCase();
  const payload =
    method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  const call = (token: string | null) => {
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const contentType = request.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    const accept = request.headers.get('accept');
    if (accept) headers.set('Accept', accept);

    return fetch(upstreamUrl, {
      method,
      headers,
      body: payload ?? null,
      cache: 'no-store',
    });
  };

  let upstream = await call(accessToken);

  // A live-but-rejected token means the session moved under us — refresh once
  // and replay before treating the caller as logged out.
  if (upstream.status === 401 && !omitCredentials) {
    const refreshed = await forceRefresh();
    if (refreshed && refreshed !== accessToken) {
      upstream = await call(refreshed);
    }
  }

  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  const response =
    upstream.status === 204 || method === 'HEAD'
      ? new Response(null, { status: upstream.status, headers })
      : new Response(upstream.body, { status: upstream.status, headers });

  // A rejected credential invalidates the server-held role cookies too, so the
  // middleware routes the next navigation to sign-in.
  if (upstream.status === 401 && !omitCredentials) clearRoleCookies(response);

  // Upstream redirects name the upstream host, which the browser has no reason
  // to know (and cannot reach in production). Re-point them at this gateway.
  const location = response.headers.get('location');
  if (location && upstream.status >= 300 && upstream.status < 400) {
    try {
      const absolute = new URL(location, `${trimmedBase}/`);
      if (absolute.origin === upstreamBase.origin) {
        let rest = absolute.pathname;
        if (upstreamBasePath && rest.startsWith(upstreamBasePath)) {
          rest = rest.slice(upstreamBasePath.length);
        }
        if (!rest.startsWith('/')) rest = `/${rest}`;
        // A `//` prefix would turn the rewritten value into an open redirect.
        if (rest.startsWith('//')) rest = '/';
        response.headers.set('location', `/api/${target}${rest}${absolute.search}`);
      } else if (location.startsWith('//')) {
        // Protocol-relative values would ride our own origin to a host the
        // upstream never intended to name, so they are dropped rather than kept.
        response.headers.set('location', '/');
      }
    } catch {
      // Relative or malformed values are passed through untouched.
    }
  }

  return response;
}
