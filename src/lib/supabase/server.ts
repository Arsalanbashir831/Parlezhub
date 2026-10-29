import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client.
 * Used in Server Components, Route Handlers, and proxy.ts.
 *
 * The session (access + refresh tokens) is stored in httpOnly cookies, so
 * browser JavaScript cannot read or steal it. Nothing on this side may be
 * exposed to the client — tokens are used by server code only.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies cannot be set.
            // This is fine; the proxy.ts middleware will handle refreshing.
          }
        },
      },
    }
  );
}

/**
 * A live access token for server-side upstream calls, refreshing the session
 * when it has expired. Returns null when there is no valid session, in which
 * case the caller must reject the request rather than forward it unauthenticated.
 */
export async function getValidAccessToken(
  client?: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const supabase = client ?? (await createClient());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const expiresAt = session?.expires_at;
  const isLive =
    !!session?.access_token &&
    !!expiresAt &&
    expiresAt * 1000 > Date.now() + 30_000;

  if (isLive) return session!.access_token;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) return null;

  return data.session.access_token;
}
