import { NextRequest, NextResponse } from 'next/server';

import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const paramsSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order number must be a number',
      'number.integer': 'Order number must be an integer',
      'number.positive': 'Order number must be positive',
      'any.required': 'Order number is required'
    }),
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required'
  })
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const url = new URL(req.url);
  const userIdParam = url.searchParams.get('userId');

  console.log(resolvedParams);

  const { error, value } = paramsSchema.validate({
    id: Number(resolvedParams.id),
    userId: userIdParam
  });

  if (error) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const { id: orderId, userId } = value;

  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderId, userId },
      include: { products: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({
      error: message
    }, {
      status: 500
    });
  }
}
