import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'http://localhost:5000';

// PUT: proxy save to backend (pass Authorization header through)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`${BACKEND}/api/admin/home-banner`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ message: 'Lỗi proxy: ' + err.message }, { status: 503 });
  }
}
