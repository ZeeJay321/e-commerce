import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const file = form.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File missing' }, { status: 400 });
    }

    console.log('Here 1');

    const fastapiRes = await fetch('http://127.0.0.1:8000/products/import-csv', {
      method: 'POST',
      body: form
    });

    console.log('Here 2');

    const data = await fastapiRes.json();

    console.log('Here 3');

    if (!fastapiRes.ok) {
      return NextResponse.json(
        { error: data.error || 'FastAPI import failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'CSV imported', data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', detail: `${err}` },
      { status: 500 }
    );
  }
}
