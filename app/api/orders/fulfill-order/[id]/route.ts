import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  try {
    const resolvedParams = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = Number(resolvedParams.id);
    const isAdmin = session.user.role === 'admin';

    const whereCondition = isAdmin
      ? { orderNumber: orderId }
      : { orderNumber: orderId, userId: session.user.id };

    const result = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findFirst({
        where: whereCondition
      });

      if (!existingOrder) {
        throw new Error('Order not found or not authorized');
      }

      if (existingOrder.orderStatus === 'SHIPPED') {
        throw new Error('Order already shipped');
      }

      if (existingOrder.orderStatus === 'PENDING' || existingOrder.orderStatus === 'FAILED') {
        throw new Error('Order is not Shippable yet');
      }

      const updatedOrder = await tx.order.update({
        where: { id: existingOrder.id, orderStatus: 'FULFILLED' },
        data: { orderStatus: 'SHIPPED' }
      });

      return updatedOrder;
    });

    return NextResponse.json(
      { message: 'Order shipped successfully', order: result },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
