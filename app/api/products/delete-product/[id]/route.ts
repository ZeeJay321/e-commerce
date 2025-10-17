import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { id } = resolvedParams;

    const updatedProduct = await prisma.$transaction(async (tx) => tx.product.update({
      where: { id },
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
