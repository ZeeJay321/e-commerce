import { NextResponse } from 'next/server';

import Joi from 'joi';

import { Prisma, PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  skip: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'skip must be a number',
      'number.min': 'skip must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'limit must be a number',
      'number.min': 'limit must be at least 1'
    }),
  query: Joi.string().allow('').optional(),
  sortOption: Joi.string()
    .valid('priceLowHigh', 'priceHighLow', 'nameAZ', 'nameZA')
    .optional()
});

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

    const { error, value } = schema.validate(params, { abortEarly: false });
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

    console.log(take);

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
