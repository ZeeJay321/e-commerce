import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

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

    const variant = await prisma.productVariant.findUnique({
      where: { id }
    });

    if (!variant) {
      return NextResponse.json(
        { error: `Variant with ID ${id} not found` },
        { status: 404 }
      );
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: { isDeleted: !variant.isDeleted }
    });

    const message = updatedVariant.isDeleted
      ? `Product Variant ${updatedVariant.id} marked as deleted`
      : `Product Variant ${updatedVariant.id} reactivated`;

    return NextResponse.json({
      message,
      variant: updatedVariant
    }, {
      status: 200
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
