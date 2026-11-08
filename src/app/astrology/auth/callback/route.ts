import type { NextRequest } from 'next/server';

import { handleAuthCallback } from '@/lib/auth-callback';

/** Supabase redirect target for astrology sign-ups, Google sign-in and recovery links. */
export function GET(request: NextRequest) {
  return handleAuthCallback(request, 'astrology');
}
