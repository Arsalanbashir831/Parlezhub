import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      throw new Error('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set');
    }

    // Return the public key directly for Vapi Web SDK initialization
    // As per Vapi documentation: const vapi = new Vapi('YOUR_PUBLIC_API_KEY');
    return NextResponse.json({
      token: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
    });
  } catch (error: unknown) {
    console.error('[GET /api/vapi/web-token] error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to get web token: ${errorMessage}` },
      { status: 500 }
    );
  }
}
