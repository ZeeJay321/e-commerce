import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';
import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
    }),
  confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword');

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { token, password } = value;

    const result = await prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!resetToken || resetToken.expires < new Date()) {
        throw new Error('Reset token is invalid or expired');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      });

      await tx.passwordResetToken.delete({
        where: { id: resetToken.id }
      });

      return true;
    });

    if (result) {
      return NextResponse.json(
        { message: 'Password has been reset successfully' },
        { status: 200 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({
      error: message || 'Something went wrong'
    }, {
      status: 500
    });
  }
}
