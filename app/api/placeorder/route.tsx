import { NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    const { userId, items } = body as {
      userId: number;
      items: { productId: number; quantity: number }[];
    };

    if (!userId || !items?.length) {
      return NextResponse.json(
        { error: 'userId and items are required' },
        { status: 400 }
      );
    }

    // Fetch product prices to calculate totals
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    // Build orderItems with price from DB
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      };
    });

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create new order with items
    const order = await prisma.order.create({
      data: {
        userId,
        amount: total,
        products: {
          create: orderItems
        },
        metadata: {}
      },
      include: { products: true }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create an order' }, { status: 500 });
  }
}
