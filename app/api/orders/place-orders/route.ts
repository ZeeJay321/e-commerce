import { NextResponse } from 'next/server';

import moment from 'moment';

import { PrismaClient } from '@/app/generated/prisma';
import { placeOrderSchema } from '@/lib/validation/order-schemas';
import { OrderItemInput } from '@/models';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error, value } = placeOrderSchema.validate(body, { abortEarly: false, convert: true });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { userId, items } = value as { userId: string; items: OrderItemInput[] };

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const { validItems, outOfStock } = items.reduce(
      (acc, item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          acc.outOfStock.push({
            productId: item.productId,
            title: 'Unknown product',
            availableStock: 0,
            requested: item.quantity
          });
          return acc;
        }

        if (product.stock < item.quantity) {
          acc.outOfStock.push({
            productId: product.id,
            title: product.title,
            availableStock: product.stock,
            requested: item.quantity
          });
          return acc;
        }

        acc.validItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        });

        return acc;
      },
      {
        validItems: [] as { productId: string; quantity: number; price: number }[],
        outOfStock: [] as {
          productId: string;
          title: string;
          availableStock: number;
          requested: number;
        }[]
      }
    );

    if (outOfStock.length > 0) {
      return NextResponse.json(
        { error: 'Some products are out of stock', outOfStock },
        { status: 400 }
      );
    }

    let total = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    total += total * 0.1; // 10% tax

    const formattedDate = moment().format('DD-MM-YY HH:mm:ss');

    const order = await prisma.$transaction(async (tx) => {
      await Promise.all(
        validItems.map((item) => tx.product.update({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        }))
      );

      return tx.order.create({
        data: {
          userId,
          amount: total,
          date: formattedDate,
          products: { create: validItems },
          metadata: {}
        },
        include: { products: true }
      });
    });

    return NextResponse.json({
      message: `New Order ${order.orderNumber} created successfully`
    }, {
      status: 201
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || 'Failed to create an order' },
      { status: 500 }
    );
  }
}
