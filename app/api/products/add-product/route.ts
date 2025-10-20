import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';

import { NextRequest, NextResponse } from 'next/server';

import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

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

type VariantForm = {
  id: string;
  price: string;
  quantity: string;
  color: string;
  colorCode?: string;
  size: 'S' | 'M' | 'L' | 'XL';
  image?: string;
};

export async function POST(req: NextRequest) {
  try {
    const newId = uuidv4();

    const nodeStream = Readable.fromWeb(req.body as NodeReadableStream<Uint8Array>);
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
      upload.any() as unknown as (
        request: MulterLikeRequest,
        response: Response,
        cb: (err?: unknown) => void
      ) => void
    );

    const { body, files } = expressReq;

    let variants: VariantForm[] = [];
    try {
      variants = JSON.parse(body.variants);
    } catch {
      variants = [];
    }

    (files || []).forEach((file) => {
      const idMatch = file.fieldname.match(/^image_(.+)$/);
      if (idMatch) {
        const variantId = idMatch[1];
        const variant = variants.find((v) => v.id === variantId);
        if (variant) variant.image = `/home/images/${file.filename}`;
      }
    });

    const productData = {
      name: body.name,
      variants
    };

    const created = await prisma.product.create({
      data: {
        id: newId,
        title: productData.name,
        variants: {
          create: productData.variants.map((v: VariantForm) => ({
            id: v.id,
            price: Number(v.price),
            stock: Number(v.quantity),
            color: v.color,
            colorCode: v.colorCode,
            size: v.size,
            isDeleted: false,
            img: v.image ?? ''
          }))
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(
      { message: `Product ${created.id} created successfully.` },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
