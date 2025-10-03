import { NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';
import { stockSchema } from '@/lib/validation/product-schemas';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error, value } = stockSchema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { productIds } = value as { productIds: string[] };

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        stock: true
      }
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
