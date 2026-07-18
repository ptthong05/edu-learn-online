import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'http://localhost:5000';

// POST: proxy image upload to backend
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const formData = await req.formData();
    
    const res = await fetch(`${BACKEND}/api/admin/upload-image`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ message: 'Lỗi proxy: ' + err.message }, { status: 503 });
  }
}
