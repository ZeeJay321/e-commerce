import { NextRequest, NextResponse } from 'next/server';

import Joi from 'joi';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// ✅ Joi schema for route params
const paramsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  userId: Joi.number().integer().positive().required()
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const url = new URL(req.url);
  const userIdParam = url.searchParams.get('userId');

  const { error, value } = paramsSchema.validate({
    id: Number(resolvedParams.id),
    userId: Number(userIdParam)
  });

  if (error) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const { id: orderId, userId } = value;

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { products: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
