import { NextResponse } from 'next/server';

import Joi from 'joi';
import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

const schema = Joi.object({
  limit: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'limit must be a number',
      'number.min': 'limit must be at least 0'
    }),
  skip: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'skip must be a number',
      'number.min': 'skip must be at least 0'
    }),
  query: Joi.string().optional().allow('', null)
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const params = {
      limit: searchParams.get('limit'),
      skip: searchParams.get('skip'),
      query: searchParams.get('query')
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

    const {
      limit,
      skip,
      query
    } = value as {
      limit: number;
      skip: number;
      query?: string | null;
    };

    const baseCondition = session.user.role === 'admin'
      ? {}
      : { userId: session.user.id };

    let whereCondition: Record<string, unknown> = { ...baseCondition };

    if (query && query.trim() !== '') {
      const conditions: object[] = [];

      if (/^\d+$/.test(query)) {
        conditions.push({ orderNumber: Number(query) });
      }

      conditions.push({
        user: {
          fullname: {
            contains: query,
            mode: 'insensitive'
          }
        }
      });

      whereCondition = {
        AND: [
          baseCondition,
          {
            OR: conditions
          }
        ]
      };
    }

    const totalOrders = await prisma.order.count({ where: baseCondition });

    const totalPagination = await prisma.order.count({ where: whereCondition });

    const amountAgg = await prisma.order.aggregate({
      _sum: { amount: true },
      where: baseCondition
    });
    const totalAmount = amountAgg._sum.amount || 0;

    const productsAgg = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: { order: baseCondition }
    });
    const totalProducts = productsAgg._sum.quantity || 0;

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        user: { select: { fullname: true } },
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && skip ? { skip: (skip - 1) * limit, take: limit } : {})
    });

    return NextResponse.json(
      {
        totalOrders,
        totalAmount,
        totalProducts,
        totalPagination,
        limit,
        skip,
        query,
        orders: orders.map((order) => ({
          ...order,
          user: order.user.fullname,
          productsCount: order._count.products
        }))
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
