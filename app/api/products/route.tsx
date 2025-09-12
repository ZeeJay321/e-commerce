import { NextResponse } from 'next/server';

import Joi from 'joi';

import { Prisma, PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  segment: Joi.number().integer().min(0).optional(),
  slice: Joi.number().integer().min(0).optional(),
  query: Joi.string().allow('').optional(),
  sortOption: Joi.string().optional()
    .valid('priceLowHigh', 'priceHighLow', 'nameAZ', 'nameZA', null)
    .optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error, value } = schema.validate(body, { abortEarly: false });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const {
      segment, slice, query, sortOption
    } = value;

    const skip = segment && slice ? (segment - 1) * slice : undefined;
    const take = slice;

    let where: Prisma.ProductWhereInput | undefined;

    if (query) {
      where = { title: { contains: query, mode: 'insensitive' } };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput; // ✅ Prisma type
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
        orderBy = { id: 'asc' };
        break;
    }

    if (segment !== 0 && slice !== 0) {
      console.log('\n\n', {
        skip,
        take,
        where,
        orderBy
      });
      const products = await prisma.product.findMany({
        skip,
        take,
        where,
        orderBy
      });
      console.log('\n\n', 'products', products.length);
      return NextResponse.json(products);
    }
    const products = await prisma.product.findMany({
      where,
      orderBy
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
