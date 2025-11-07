import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = Number(searchParams.get('skip')) || 1;
    const query = searchParams.get('query') || '';

    const baseCondition = session.user.role === 'admin'
      ? {}
      : { userId: session.user.id };

    const latestSummary = await prisma.orderSummary.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let totalOrders = 0;
    let totalProducts = 0;
    let totalAmount = 0;
    let summaryCreatedAt: Date | null = null;

    if (latestSummary) {
      totalOrders = latestSummary.totalOrders;
      totalProducts = latestSummary.totalProductsInOrders;
      totalAmount = latestSummary.totalOrderAmount;
      summaryCreatedAt = latestSummary.createdAt;
    }

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

    const totalPagination = await prisma.order.count({
      where: baseCondition
    });

    const orders = await prisma.order.findMany({
      where: whereCondition,
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        amount: true,
        date: true,
        createdAt: true,
        orderStatus: true,
        user: {
          select: { fullname: true }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && skip ? { skip: (skip - 1) * limit, take: limit } : {})
    });

    return NextResponse.json({
      totalOrders,
      totalAmount,
      totalProducts,
      summaryCreatedAt,
      totalPagination,
      limit,
      skip,
      query,
      orders: orders.map((order) => ({
        ...order,
        user: order.user.fullname,
        productsCount: order._count.products
      }))
    }, {
      status: 200
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
