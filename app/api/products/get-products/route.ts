import { NextResponse } from 'next/server';

import { Prisma, PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const skip = Number(searchParams.get('skip')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const query = searchParams.get('query') || '';
    const sortOption = searchParams.get('sortOption') || '';

    const page = skip;
    const take = limit;
    const offset = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(query && {
        title: { contains: query, mode: 'insensitive' }
      })
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput;

    switch (sortOption) {
      case 'nameAZ':
        orderBy = { title: 'asc' };
        break;
      case 'nameZA':
        orderBy = { title: 'desc' };
        break;
      case 'dateNewest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'dateOldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const products = await prisma.product.findMany({
      skip: offset,
      take,
      where,
      orderBy,
      include: {
        variants: {
          select: {
            id: true,
            img: true,
            color: true,
            colorCode: true,
            size: true,
            price: true,
            stock: true
          },
          where: { isDeleted: false }
        }
      }
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({ products, total }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
