import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { token, password } = body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Reset token is invalid or expired' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password, 10);

      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiresAt: null
        }
      });
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { error: message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
