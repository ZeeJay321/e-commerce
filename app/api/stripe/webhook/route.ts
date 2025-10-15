import { NextResponse } from 'next/server';

import Stripe from 'stripe';

import { PrismaClient } from '@/app/generated/prisma';
import stripe from '@/lib/stripe';
import { createAndSendInvoice } from '@/services/stripe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${err}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const order = await prisma.order.findFirst({
          where: { sessionId: session.id },
          include: { products: true }
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { orderStatus: 'FULFILLED' }
          });

          const items = order.products.map((item) => ({
            title: `Product (${item.variantId})`,
            price: item.price,
            quantity: item.quantity
          }));

          await createAndSendInvoice(session.customer as string, items);
        }

        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const order = await prisma.order.findFirst({
          where: { sessionId: session.id }
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { orderStatus: 'FAILED' }
          });
        }

        break;
      }

      default:
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `Webhook handler failed: ${err}` }, { status: 500 });
  }
}
