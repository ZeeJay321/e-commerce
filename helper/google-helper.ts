import crypto from 'crypto';

import stripe from '@/lib/stripe';

import { PrismaClient } from '@/app/generated/prisma';

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

  const customer = await stripe.customers.create({
    name,
    email
  });

  return prisma.user.create({
    data: {
      email,
      fullname: name ?? 'Google User',
      phoneNumber: `google_${Date.now()}`,
      password: randomPassword,
      role: 'user',
      stripeCustomerId: customer.id,
      metadata: {
        provider: 'google',
        image
      }
    }
  });
}
