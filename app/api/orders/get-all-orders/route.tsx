import { NextResponse } from 'next/server';

import Joi from 'joi';
import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

const schema = Joi.object({
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params = {
      slice: searchParams.get('slice'),
      segment: searchParams.get('segment')
    };

    const { error, value } = schema.validate(params, {
      abortEarly: false,
      convert: true
    });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { slice, segment } = value;

    const whereCondition = session.user.role === 'admin' ? {} : { userId: session.user.id };

    const totalOrders = await prisma.order.count({
      where: whereCondition
    });

    let orders;
    if (slice === 0 || segment === 0) {
      orders = await prisma.order.findMany({
        where: whereCondition,
        include: {
          products: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      orders = await prisma.order.findMany({
        where: whereCondition,
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

    return NextResponse.json(
      {
        totalOrders,
        slice,
        segment,
        orders: orders.map((order) => ({
          ...order,
          userId: order.userId
        }))
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
