import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';
import { sendResetLink } from '@/helper/reset-email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const { email } = body.email;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 10);

    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If that email exists, reset instructions were sent.' },
        { status: 200 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiresAt: tokenExpiry
      }
    });

    await sendResetLink(baseUrl, email, token);

    return NextResponse.json({
      message: 'If that email exists, reset instructions were sent.'
    }, {
      status: 200
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
