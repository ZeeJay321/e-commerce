import { NextResponse } from 'next/server';

import moment from 'moment';

import { PrismaClient } from '@/app/generated/prisma';
import { placeOrderSchema } from '@/lib/validation/order-schemas';
import { OrderItemInput } from '@/models';
import { createCheckoutSession } from '@/services/stripe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error, value } = placeOrderSchema.validate(body, {
      abortEarly: false,
      convert: true
    });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { userId, items } = value as { userId: string; items: OrderItemInput[] };

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true }
    });

    const { validItems, outOfStock } = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);

      if (!product || !variant) {
        acc.outOfStock.push({
          productId: item.productId,
          variantId: item.variantId,
          title: product?.title ?? 'Unknown Product',
          availableStock: 0,
          requested: item.quantity
        });
        return acc;
      }

      if (variant.stock < item.quantity) {
        acc.outOfStock.push({
          productId: product.id,
          variantId: variant.id,
          title: `${product.title} (${variant.color}, ${variant.size})`,
          availableStock: variant.stock,
          requested: item.quantity
        });
        return acc;
      }

      acc.validItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        title: `${product.title} (${variant.color}, ${variant.size})`,
        price: variant.price
      });

      return acc;
    }, {
      validItems: [] as {
        productId: string;
        variantId: string;
        quantity: number;
        title: string;
        price: number;
      }[],
      outOfStock: [] as {
        productId: string;
        variantId: string;
        title: string;
        availableStock: number;
        requested: number;
      }[]
    });

    if (outOfStock.length > 0) {
      return NextResponse.json(
        { error: 'Some variants are out of stock', outOfStock },
        { status: 400 }
      );
    }

    let total = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    total += total * 0.1;

    const formattedDate = moment().format('DD-MM-YY HH:mm:ss');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found for this user' },
        { status: 400 }
      );
    }

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found for this user' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession({
      customerId: user.stripeCustomerId,
      items: validItems,
      email: user.email
    });

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        validItems.map((item) => tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        }))
      );

      await tx.order.create({
        data: {
          userId,
          amount: total,
          date: formattedDate,
          sessionId: session.id,
          products: {
            create: validItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price
            }))
          },
          metadata: {}
        }
      });
    });

    return NextResponse.json({
      status: 'success',
      url: session.url
    }, {
      status: 201
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: 'error',
      message: message || 'Failed to create an order'
    }, {
      status: 500
    });
  }
}
