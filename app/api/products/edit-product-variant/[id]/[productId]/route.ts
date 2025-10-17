import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { NextRequest, NextResponse } from 'next/server';

import type { Response } from 'express';

import { PrismaClient } from '@/app/generated/prisma';
import { runMiddleware, upload } from '@/lib/multer';

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
  context: { params: { id: string, productId: string } }
) {
  try {
    const { id, productId } = context.params;

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

    const updateData: Record<string, unknown> = {};
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.quantity !== undefined) updateData.stock = parseInt(body.quantity, 10);
    if (body.color) updateData.color = body.color;
    if (body.colorCode) updateData.colorCode = body.colorCode;
    if (body.size) updateData.size = body.size;
    if (file) updateData.img = `/home/images/${file.filename}`;
    updateData.isDeleted = false;

    const updated = await prisma.productVariant.update({
      where: { id },
      data: {
        ...updateData,
        product: {
          connect: { id: productId }
        }
      }
    });

    return NextResponse.json(
      { message: `Variant ${updated.id} updated successfully` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
