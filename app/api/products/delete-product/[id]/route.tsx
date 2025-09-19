import { NextResponse } from 'next/server';

import Joi from 'joi';
import { getServerSession } from 'next-auth/next';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

const schema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required()
});

export async function DELETE(
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

    const { error } = schema.validate({ id });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { productId: id }
      });

      await tx.product.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
