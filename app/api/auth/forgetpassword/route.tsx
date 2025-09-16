// app/api/auth/forgot/route.ts
import crypto from 'crypto';

import { NextResponse } from 'next/server';

import nodemailer from 'nodemailer';

import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// ✅ Joi schema for validation
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

    // ✅ Validate input
    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { email } = value;

    // ✅ Run in transaction
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 10); // 10 mins

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Security: do not reveal if email exists
      return NextResponse.json(
        { message: 'If that email exists, reset instructions were sent.' },
        { status: 200 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // remove old tokens if any
      await tx.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });

      // create new token
      await tx.passwordResetToken.create({
        data: {
          token,
          expires: tokenExpiry,
          userId: user.id
        }
      });
    });

    const resetUrl = `${baseUrl}resetpassword?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // yourname@yandex.com
        pass: process.env.EMAIL_PASS // Yandex app password
      }
    });

    // Send reset email
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Instructions',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 10 minutes.</p>
      `
    });

    return NextResponse.json(
      { message: 'Reset email sent.' },
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
