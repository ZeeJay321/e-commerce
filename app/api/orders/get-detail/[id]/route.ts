import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';
import { getDetailSchema } from '@/lib/validation/order-schemas';

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

    const { error, value } = getDetailSchema.validate({
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
      select: {
        id: true,
        userId: true,
        amount: true,
        date: true,
        user: { select: { fullname: true } },
        products: {
          select: {
            id: true,
            productId: true,
            price: true,
            quantity: true,
            product: {
              select: {
                img: true,
                title: true,
                stock: true,
                color: true,
                colorCode: true,
                size: true
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
