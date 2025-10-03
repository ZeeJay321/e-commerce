import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { IncomingHttpHeaders } from 'http';

import { NextRequest, NextResponse } from 'next/server';

import type { Response } from 'express';

import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@/app/generated/prisma';
import { runMiddleware, upload } from '@/lib/multer';
import { addProductSchema } from '@/lib/validation/product-schemas';

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
    const newId = uuidv4();

    const nodeStream = Readable.fromWeb(
      req.body as NodeReadableStream<Uint8Array>
    );

    const expressReq: MulterLikeRequest = Object.assign(nodeStream, {
      headers: Object.fromEntries(req.headers) as IncomingHttpHeaders,
      method: req.method ?? 'POST',
      url: req.url,
      body: {},
      query: { id: newId }
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

    const { error, value } = addProductSchema.validate(body, { abortEarly: false });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const createData = {
      id: newId,
      title: value.name,
      price: value.price,
      stock: value.quantity,
      color: value.color,
      colorCode: value.colorCode,
      size: value.size,
      isDeleted: true,
      img: file ? `/home/images/${file.filename}` : ''
    };

    const created = await prisma.product.create({ data: createData });

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
