import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { NextRequest, NextResponse } from 'next/server';

import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@/app/generated/prisma';
import { runMiddleware, upload } from '@/lib/multer';
import { addVariantSchema } from '@/lib/validation/product-schemas';

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

    const newId = uuidv4();

    const nodeStream = Readable.fromWeb(
      req.body as NodeReadableStream<Uint8Array>
    );

    const expressReq: MulterLikeRequest = Object.assign(nodeStream, {
      headers: Object.fromEntries(req.headers) as IncomingHttpHeaders,
      method: req.method ?? 'POST',
      url: req.url,
      body: {},
      query: { id: newId, productId }
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

    const { error, value } = addVariantSchema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        id: newId,
        productId,
        color: value.color,
        colorCode: value.colorCode,
        size: value.size,
        price: parseFloat(value.price),
        stock: parseInt(value.quantity, 10),
        isDeleted: false,
        img: file ? `/home/images/${file.filename}` : ''
      }
    });

    return NextResponse.json({
      message: `Variant ${variant.id} added successfully`,
      variant
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
