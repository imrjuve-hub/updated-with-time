export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ ok: true, runtime: 'node' });
}
