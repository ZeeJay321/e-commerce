import { NextResponse } from 'next/server';

import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  console.log(req);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)'
    });

    return NextResponse.json(response.data.files);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
