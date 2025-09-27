import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      !body.name
      || !body.price
      || !body.quantity
      || !body.color
      || !body.colorCode
      || !body.size
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const created = await prisma.product.create({
      data: {
        title: body.name,
        price: parseFloat(body.price),
        stock: parseInt(body.quantity, 10),
        color: body.color,
        colorCode: body.colorCode,
        size: body.size,
        img: ''
      }
    });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
