import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
      }),
    });

    const data = await r.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[GET /api/session] error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
