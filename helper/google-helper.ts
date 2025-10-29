import crypto from 'crypto';

import { PrismaClient } from '@/app/generated/prisma';
import { createStripeCustomer } from '@/services/stripe';

const prisma = new PrismaClient();

export async function createGoogleUser({
  email,
  name,
  image
}: {
  email: string;
  name: string;
  image?: string | null;
}) {
  const randomPassword = crypto.randomBytes(16).toString('hex');

  const customer = await createStripeCustomer(name, email);

  return prisma.user.create({
    data: {
      email,
      fullname: name ?? 'Google User',
      phoneNumber: `google_${Date.now()}`,
      password: randomPassword,
      role: 'user',
      stripeCustomerId: customer,
      metadata: {
        provider: 'google',
        image
      }
    }
  });
}
