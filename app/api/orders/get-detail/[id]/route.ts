import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

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

    const orderId = Number(resolvedParams.id);
    const isAdmin = session.user.role === 'admin';

    const whereCondition = isAdmin
      ? { orderNumber: orderId }
      : { orderNumber: orderId, userId: session.user.id };

    const order = await prisma.order.findFirst({
      where: whereCondition,
      select: {
        id: true,
        userId: true,
        amount: true,
        date: true,
        user: { select: { fullname: true, email: true } },
        products: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            price: true,
            quantity: true,
            product: {
              select: {
                title: true
              }
            },
            variant: {
              select: {
                stock: true,
                img: true
              }
            }
          }
        }
      }
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
