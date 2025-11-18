import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { NextRequest, NextResponse } from 'next/server';

import type { Response } from 'express';

import { PrismaClient } from '@/app/generated/prisma';
import { runMiddleware, upload } from '@/lib/multer';
import { Size } from '@/models';

const prisma = new PrismaClient();

interface MulterLikeRequest extends Readable {
  headers: IncomingHttpHeaders;
  method: string;
  url: string;
  body: Record<string, string>;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      );
    }

    const nodeStream = Readable.fromWeb(
      req.body as NodeReadableStream<Uint8Array>
    );

    const expressReq: MulterLikeRequest = Object.assign(nodeStream, {
      headers: Object.fromEntries(req.headers) as IncomingHttpHeaders,
      method: req.method ?? 'POST',
      url: req.url,
      body: {}
    });

    const expressRes = {} as unknown as Response;

    await runMiddleware(
      expressReq,
      expressRes,
      upload.single('image') as unknown as (
        request: MulterLikeRequest,
        response: Response,
        cb: (err?: unknown) => void
      ) => void
    );

    const { body, file } = expressReq;

    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId,
        color: body.color,
        size: body.size as Size
      }
    });

    if (existingVariant) {
      return NextResponse.json(
        {
          error: `Variant with color "${body.color}" and size "${body.size}" already exists for this product.`
        },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        color: body.color,
        colorCode: body.colorCode,
        size: body.size as Size,
        price: parseFloat(body.price),
        stock: parseInt(body.quantity, 10),
        isDeleted: false,
        img: file ? `/home/images/${file.filename}` : ''
      }
    });

    return NextResponse.json(
      { message: `Variant ${variant.id} added successfully` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error) },
      { status: 500 }
    );
  }
}
