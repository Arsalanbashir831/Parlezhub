import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client.
 * Used in Server Components, Route Handlers, and proxy.ts.
 * Reads/writes the session from HTTP-only cookies (managed by @supabase/ssr).
 * Uses the new Publishable key (sb_publishable_...) which replaces the legacy anon key.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
