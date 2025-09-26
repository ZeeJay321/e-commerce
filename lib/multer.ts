import fs from 'fs';
import path from 'path';

import { IncomingHttpHeaders } from 'http';

import { Readable } from 'stream';

import type { Request } from 'express';
import multer from 'multer';

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

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

// Configure Multer storage
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/home/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(request, file, cb) {
    const typedReq = request as MulterRequest;

    const productId = (typedReq.query?.id as string)
      || (typedReq.body?.id as string)
      || 'unknown';

    const ext = path.extname(file.originalname);
    const fileName = `${productId}${ext}`;

    const fullPath = path.join(process.cwd(), 'public/home/images', fileName);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    cb(null, fileName);
  }
});

export const upload = multer({ storage });

export function runMiddleware<
  Req extends MulterLikeRequest,
  Res extends MulterLikeResponse
>(
  outerReq: Req,
  outerRes: Res,
  fn: (request: Req, response: Res, cb: (err?: unknown) => void) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(outerReq, outerRes, (result?: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
}
