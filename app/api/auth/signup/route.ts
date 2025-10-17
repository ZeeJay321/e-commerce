import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';

import { PrismaClient } from '@/app/generated/prisma';
import { createStripeCustomer } from '@/services/stripe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword
    } = body;
    const emailLower = email.toLowerCase();

    const customer = await createStripeCustomer(fullName, email);

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { email: emailLower }
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not Match');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      return tx.user.create({
        data: {
          fullname: fullName,
          email: emailLower,
          phoneNumber,
          password: hashedPassword,
          stripeCustomerId: customer.id
        }
      });
    });

    return NextResponse.json({
      message: 'User created successfully', userId: user.id
    }, {
      status: 201
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({
      error: message || 'Failed to create user'
    }, {
      status: 500
    });
  }
}
