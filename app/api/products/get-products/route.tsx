import { NextResponse } from 'next/server';

import Joi from 'joi';

import { Prisma, PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

const schema = Joi.object({
  segment: Joi.number().integer().min(0).optional(),
  slice: Joi.number().integer().min(0).optional(),
  query: Joi.string().allow('').optional(),
  sortOption: Joi.string()
    .valid(
      'priceLowHigh',
      'priceHighLow',
      'nameAZ',
      'nameZA',
      null
    )
    .optional()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params = {
      segment: searchParams.get('segment') ? Number(searchParams.get('segment')) : 0,
      slice: searchParams.get('slice') ? Number(searchParams.get('slice')) : 0,
      query: searchParams.get('query') || '',
      sortOption: searchParams.get('sortOption')
    };

    const { error, value } = schema.validate(params, { abortEarly: false });
    if (error) {
      return NextResponse.json({
        error: error.details.map((d) => d.message)
      }, {
        status: 400
      });
    }

    const {
      segment,
      slice,
      query,
      sortOption
    } = value;

    const skip = segment && slice ? (segment - 1) * slice : undefined;
    const take = slice || undefined;

    let where: Prisma.ProductWhereInput | undefined;
    if (query) {
      where = { title: { contains: query, mode: 'insensitive' } };
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
        orderBy = { id: 'asc' };
        break;
    }

    const products = await prisma.product.findMany({
      skip,
      take,
      where,
      orderBy
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json(
      {
        products,
        total
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json({
      error: message
    }, {
      status: 500
    });
  }
}
