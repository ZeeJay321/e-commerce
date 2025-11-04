import fs from 'fs';
import { IncomingHttpHeaders } from 'http';
import path from 'path';
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

    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    const productId = (typedReq.query?.id as string)
      || (typedReq.body?.id as string)
      || base;

    const fileName = `${productId}${ext}`;

    const uploadPath = path.join(process.cwd(), 'public/home/images', fileName);
    if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);

    cb(null, fileName);
  }
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Only JPG, JPEG, and PNG files are allowed.'));
    return;
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter
});

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
