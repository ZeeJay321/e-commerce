import { NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = body as { userId: number };

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        products: {
          include: {
            product: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
