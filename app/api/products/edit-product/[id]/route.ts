import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title } = await req.json();

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { title: title.trim() }
    });

    return NextResponse.json(
      {
        message: 'Product title updated sucessfully',
        product: {
          id: updatedProduct.id,
          title: updatedProduct.title
        }
      },
      { status: 200 } // OK
    );
  } catch (err) {
    console.error('Error updating product title:', err);

    return NextResponse.json(
      {
        message:
          err instanceof Error
            ? err.message
            : 'An error occurred while updating the product title'
      },
      { status: 500 }
    );
  }
}
