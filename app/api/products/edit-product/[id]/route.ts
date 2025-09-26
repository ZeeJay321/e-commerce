import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { IncomingHttpHeaders } from 'http';

import { NextRequest, NextResponse } from 'next/server';

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

interface MulterLikeResponse {
  statusCode?: number;
  end?: (chunk?: string | Buffer | Uint8Array) => void;
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
      body: { id }
    });

    const expressRes: MulterLikeResponse = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await runMiddleware(expressReq as any, expressRes as any, upload.single('image'));

    const { body, file } = expressReq;

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.title = body.name;
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.quantity) updateData.stock = parseInt(body.quantity, 10);
    if (body.color) updateData.color = body.color;
    if (body.colorCode) updateData.colorCode = body.colorCode;
    if (file) updateData.img = `/home/images/${file.filename}`;

    console.log(body);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('❌ Product update failed:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
