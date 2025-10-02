import crypto from 'crypto';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function createGoogleUser({
  email,
  name,
  image
}: {
  email: string;
  name: string | null | undefined;
  image?: string | null;
}) {
  const randomPassword = crypto.randomBytes(16).toString('hex');

  return prisma.user.create({
    data: {
      email,
      fullname: name ?? 'Google User',
      phoneNumber: `google_${Date.now()}`,
      password: randomPassword,
      role: 'user',
      metadata: {
        provider: 'google',
        image
      }
    }
  });
}
