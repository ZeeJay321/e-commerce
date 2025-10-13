import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@/app/generated/prisma';
import { addProductSchema } from '@/lib/validation/product-schemas';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const metadataRaw = formData.get('metadata') as string | null;

    let metadata = null;
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON format in metadata field' },
          { status: 400 }
        );
      }
    }

    const { error, value } = addProductSchema.validate({ name, metadata }, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title: value.name,
        metadata: value.metadata || null
      }
    });

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
