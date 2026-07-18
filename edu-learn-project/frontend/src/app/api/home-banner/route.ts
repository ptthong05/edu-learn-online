import { NextResponse } from 'next/server';

const BACKEND = 'http://localhost:5000';

// GET: public — proxy to backend
export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/home-banner`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json(null, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null, { status: 503 });
  }
}
