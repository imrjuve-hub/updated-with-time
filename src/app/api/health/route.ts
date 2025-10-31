export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export function GET() {
  const hasKey = !!process.env.RIOT_API_KEY && process.env.RIOT_API_KEY.length > 10;
  return NextResponse.json({ ok: true, riotKeyPresent: hasKey });
}
