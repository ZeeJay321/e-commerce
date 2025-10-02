import { NextResponse } from 'next/server';

import { Prisma, PrismaClient } from '@/app/generated/prisma';
import { getProductSchema } from '@/lib/validation/product-schemas';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params = {
      skip: searchParams.get('skip')
        ? Number(searchParams.get('skip'))
        : undefined,
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : undefined,
      query: searchParams.get('query') || '',
      sortOption: searchParams.get('sortOption') || undefined
    };

    const { error, value } = getProductSchema.validate(params, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const {
      skip,
      limit,
      query,
      sortOption
    } = value;

    const page = skip || 1;
    const take = limit || 10;
    const offset = (page - 1) * take;

    let where: Prisma.ProductWhereInput = { status: true };

    if (query) {
      where = {
        ...where,
        title: { contains: query, mode: 'insensitive' }
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sortOption) {
      case 'priceLowHigh':
        orderBy = { price: 'asc' };
        break;
      case 'priceHighLow':
        orderBy = { price: 'desc' };
        break;
      case 'nameAZ':
        orderBy = { title: 'asc' };
        break;
      case 'nameZA':
        orderBy = { title: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const products = await prisma.product.findMany({
      skip: offset,
      take,
      where,
      orderBy
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({ products, total }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
