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

    const { error, value } = getProductSchema.validate(params, {
      abortEarly: false
    });
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

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(query && {
        title: { contains: query, mode: 'insensitive' }
      })
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortOption === 'priceLowHigh' || sortOption === 'priceHighLow') {
      const grouped = await prisma.productVariant.groupBy({
        by: ['productId'],
        _min: { price: true },
        _max: { price: true }
      });

      grouped.sort((a, b) => (sortOption === 'priceLowHigh'
        ? (a._min.price ?? 0) - (b._min.price ?? 0)
        : (b._max.price ?? 0) - (a._max.price ?? 0)));

      const orderedProductIds = grouped.map((g) => g.productId);

      const products = await prisma.product.findMany({
        where,
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
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip: offset
      });

      const sortedProducts = products.sort(
        (a, b) => orderedProductIds.indexOf(a.id)
          - orderedProductIds.indexOf(b.id)
      );

      const total = await prisma.product.count({ where });

      return NextResponse.json(
        { products: sortedProducts, total },
        { status: 200 }
      );
    }

    switch (sortOption) {
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
          }
        }
      }
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({ products, total }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Product fetch failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
