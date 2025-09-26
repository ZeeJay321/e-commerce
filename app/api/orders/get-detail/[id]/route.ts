import { NextRequest, NextResponse } from 'next/server';

import Joi from 'joi';
import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

const paramsSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order number must be a number',
      'number.integer': 'Order number must be an integer',
      'number.positive': 'Order number must be positive',
      'any.required': 'Order number is required'
    })
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ validate order number only (userId check depends on role)
    const { error, value } = paramsSchema.validate({
      id: Number(resolvedParams.id)
    });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { id: orderId } = value;
    const isAdmin = session.user.role === 'admin';

    const whereCondition = isAdmin
      ? { orderNumber: orderId }
      : { userId: session.user.id, orderNumber: orderId };

    const order = await prisma.order.findFirst({
      where: whereCondition,
      include: { products: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
