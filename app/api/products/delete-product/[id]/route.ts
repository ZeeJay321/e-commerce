import { NextResponse } from 'next/server';

import Joi from 'joi';
import { getServerSession } from 'next-auth/next';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

const disableSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] })
    .required()
    .messages({
      'string.guid': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    })
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { id } = resolvedParams;

    const { error, value } = disableSchema.validate({ id });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => tx.product.update({
      where: { id: value.id },
      data: { status: false }
    }));

    return NextResponse.json(
      { success: true, product: updatedProduct },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
