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

    const { limit, skip, query } = value as {
      limit: number;
      skip: number;
      query?: string | null;
    };

    // Base condition (role restriction)
    const baseCondition = session.user.role === 'admin'
      ? {}
      : { userId: session.user.id };

    let whereCondition: Record<string, unknown> = { ...baseCondition };

    // Apply search filter
    if (query && query.trim() !== '') {
      const conditions: object[] = [];

      // Add orderNumber condition if numeric
      if (/^\d+$/.test(query)) {
        conditions.push({ orderNumber: Number(query) });
      }

      // Always add fullname condition
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

    const totalOrders = await prisma.order.count({ where: whereCondition });

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        user: { select: { fullname: true } },
        products: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && skip
        ? { skip: (skip - 1) * limit, take: limit }
        : {})
    });

    return NextResponse.json(
      {
        totalOrders,
        limit,
        skip,
        query,
        orders: orders.map((order) => ({
          ...order,
          user: order.user.fullname
        }))
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
