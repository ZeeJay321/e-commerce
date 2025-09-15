// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';
import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// Joi schema for validation
const schema = Joi.object({
  fullname: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .required()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const {
      fullname, email, phoneNumber, password
    } = value;

    const emailLower = email.toLowerCase(); // ✅ normalize email

    // Wrap everything in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Check if user exists
      const existingUser = await tx.user.findUnique({ where: { email: emailLower } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await tx.user.create({
        data: {
          fullname,
          email: emailLower, // ✅ store lowercase
          phoneNumber,
          password: hashedPassword
        }
      });

      return newUser;
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Failed to create user' }, { status: 500 });
  }
}
