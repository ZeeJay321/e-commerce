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
  items
}: {
  customerId: string;
  items: LineItem[];
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
    success_url: `${baseUrl}checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}checkout/cancel`
  });

  return session;
}
