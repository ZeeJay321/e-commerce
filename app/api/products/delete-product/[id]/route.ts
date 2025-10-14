import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';
import { disableSchema } from '@/lib/validation/product-schemas';

const prisma = new PrismaClient();

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
      data: { isDeleted: true }
    }));

    return NextResponse.json(
      {
        success: true,
        message: `Product ${updatedProduct.id} deleted successfully`,
        product: { id: updatedProduct.id }
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
