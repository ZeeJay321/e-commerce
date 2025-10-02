import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { IncomingHttpHeaders } from 'http';

import { NextRequest, NextResponse } from 'next/server';

import type { Response } from 'express';

import { PrismaClient } from '@/app/generated/prisma';
import { runMiddleware, upload } from '@/lib/multer';
import { updateProductSchema } from '@/lib/validation/product-schemas';

const prisma = new PrismaClient();

interface MulterLikeRequest extends Readable {
  headers: IncomingHttpHeaders;
  method: string;
  url: string;
  body: Record<string, string>;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const nodeStream = Readable.fromWeb(
      req.body as NodeReadableStream<Uint8Array>
    );

    const expressReq: MulterLikeRequest = Object.assign(nodeStream, {
      headers: Object.fromEntries(req.headers) as IncomingHttpHeaders,
      method: req.method ?? 'PUT',
      url: req.url,
      body: {},
      query: { id }
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

    const { error, value } = updateProductSchema.validate(body, { abortEarly: false });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (value.name) updateData.title = value.name;
    if (value.price) updateData.price = value.price;
    if (value.quantity) updateData.stock = value.quantity;
    if (value.color) updateData.color = value.color;
    if (value.colorCode) updateData.colorCode = value.colorCode;
    if (value.size) updateData.size = value.size;
    if (file) updateData.img = `/home/images/${file.filename}`;

    updateData.status = true;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
