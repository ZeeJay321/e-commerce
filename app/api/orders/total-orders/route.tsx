import { NextResponse } from 'next/server';

import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  userId: Joi.number().integer().required().messages({
    'any.required': 'userId is required',
    'number.base': 'userId must be a number'
  })
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const { error, value } = schema.validate({
      userId: userId ? Number(userId) : undefined
    });
    if (error) {
      return NextResponse.json({
        error: error.details.map((d) => d.message)
      }, {
        status: 400
      });
    }

    const totalOrders = await prisma.order.count({
      where: { userId: value.userId }
    });

    return NextResponse.json({
      userId: value.userId, totalOrders
    }, {
      status: 200
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({
      error: message
    }, {
      status: 500
    });
  }
}
