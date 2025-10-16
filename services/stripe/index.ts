
import stripe from '@/lib/stripe';

type LineItem = {
  title: string;
  price: number;
  quantity: number;
};

export async function createStripeCustomer(name: string, email: string) {
  const customer = await stripe.customers.create({ name, email });
  return customer;
}

export async function createCheckoutSession({
  customerId,
  items,
  email
}: {
  customerId: string;
  items: LineItem[];
  email: string;
}) {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title
      },
      unit_amount: Math.round(item.price * 100)
    },
    quantity: item.quantity
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * 0.1;

  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: { name: 'Sales Tax (10%)' },
      unit_amount: Math.round(taxAmount * 100)
    },
    quantity: 1
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL;

  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_URL in environment variables');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: lineItems,
    payment_intent_data: {
      receipt_email: email,
      description: 'Order payment via E-Commerce App',
      setup_future_usage: 'off_session'
    },
    success_url: `${baseUrl}orders`,
    cancel_url: `${baseUrl}`
  });
  return session;
}

export async function createAndSendInvoice(
  customerId: string,
  items: LineItem[]
) {
  if (!customerId) {
    throw new Error('Missing customerId');
  }

  if (!items.length) {
    throw new Error('At least one invoice item is required');
  }

  await Promise.all(
    items.map((item) => stripe.invoiceItems.create({
      customer: customerId,
      description: `${item.title} (x${item.quantity})`,
      amount: Math.round(item.price * item.quantity * 100),
      currency: 'usd'
    }))
  );

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxAmount = subtotal * 0.1;
  await stripe.invoiceItems.create({
    customer: customerId,
    description: 'Sales Tax (10%)',
    amount: Math.round(taxAmount * 100),
    currency: 'usd'
  });

  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true
  });

  await stripe.invoices.sendInvoice(invoice.id);

  return invoice;
}
