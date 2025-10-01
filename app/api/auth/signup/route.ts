import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';
import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  fullName: Joi.string().min(3).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 3 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Enter a valid email address',
    'string.empty': 'Email is required'
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in international format (e.g., +123456789)',
      'string.empty': 'Phone number is required'
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?=.{8,})/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      'string.empty': 'Password is required'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password',
    'string.empty': 'Confirm password is required'
  })
});

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

    const {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword
    } = value;
    const emailLower = email.toLowerCase();

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
          password: hashedPassword
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
