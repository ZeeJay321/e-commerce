import { NextResponse } from 'next/server';

import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  userId: Joi.number().integer().required().messages({
    'any.required': 'userId is required',
    'number.base': 'userId must be a number'
  }),
  slice: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'slice must be a number',
      'number.min': 'slice must be at least 0'
    }),
  segment: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'segment must be a number',
      'number.min': 'segment must be at least 0'
    })
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params = {
      userId: searchParams.get('userId'),
      slice: searchParams.get('slice'),
      segment: searchParams.get('segment')
    };

    const { error, value } = schema.validate(params, { abortEarly: false, convert: true });

    if (error) {
      return NextResponse.json({
        error: error.details.map((d) => d.message)
      }, {
        status: 400
      });
    }

    const {
      userId,
      slice,
      segment
    } = value;

    let orders;

    if (slice === 0 || segment === 0) {
      orders = await prisma.order.findMany({
        where: { userId },
        include: {
          products: {
            include: { product: true }
          }
        },
        orderBy: { date: 'desc' }
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId },
        include: {
          products: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (segment - 1) * slice,
        take: slice
      });
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({
      error: message
    }, {
      status: 500
    });
  }
}
