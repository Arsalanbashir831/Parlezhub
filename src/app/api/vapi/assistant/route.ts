import { NextRequest, NextResponse } from 'next/server';

import { getValidAccessToken } from '@/lib/supabase/server';
import { buildTutorAssistant, parseTutorConfig } from '@/lib/tutor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/vapi/assistant — the AI tutor for one practice call, plus the Vapi
 * public key to place it with. The prompt and voice stay defined on the
 * server; only signed-in users get them. The public key is read at request
 * time, so it works even when NEXT_PUBLIC_* values are set only at runtime.
 */
export async function POST(request: NextRequest) {
  if (!(await getValidAccessToken())) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: 'The AI tutor is not configured (NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing).' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseTutorConfig(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  return NextResponse.json({ publicKey, assistant: buildTutorAssistant(parsed.value) });
}
