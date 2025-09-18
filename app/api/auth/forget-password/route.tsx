import crypto from 'crypto';

import { NextResponse } from 'next/server';

import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';
import { sendResetLink } from '@/helper/reset-email';

const prisma = new PrismaClient();

const schema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { email } = value;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 10);

    const user = await prisma.user.findUnique({
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

    return NextResponse.json(
      { message: 'If that email exists, reset instructions were sent.' },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
