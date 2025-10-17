import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

import { routeSchemas } from '@/lib/validation';

const USER_PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
];
const USER_PRIVATE_PATHS = [
  '/cart',
  '/orders',
  '/order-details'
];

const ADMIN_PUBLIC_PATHS = ['/admin/login'];

const ADMIN_PRIVATE_PATHS = [
  '/admin/products',
  '/admin/orders',
  '/admin/order-details'
];

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/admin/login'
];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    const { method } = req;

    const matched = Object.entries(routeSchemas).find(
      ([path, config]) => pathname.startsWith(path) && config.method === method
    );

    if (matched) {
      const [, { schema }] = matched;

      if (schema) {
        let data: Record<string, unknown> = {};
        const contentType = req.headers.get('content-type') || '';

        try {
          if (method === 'GET') {
            data = Object.fromEntries(req.nextUrl.searchParams.entries());
          } else if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const entries = Array.from(formData.entries());
            const parsed: Record<string, unknown> = {};

            entries.forEach(([key, value]) => {
              if (typeof value === 'string') {
                try {
                  parsed[key] = JSON.parse(value);
                } catch {
                  const asNumber = Number(value);
                  if (!Number.isNaN(asNumber) && value.trim() !== '') {
                    parsed[key] = asNumber;
                  } else {
                    parsed[key] = value;
                  }
                }
              } else {
                parsed[key] = value;
              }
            });

            const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
            data = { ...queryParams, ...parsed };
          } else if (contentType.includes('application/json')) {
            data = await req.json();
            const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
            data = { ...queryParams, ...data };
          }
        } catch {
          return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { error } = schema.validate(data, { abortEarly: false });

        if (error) {
          return NextResponse.json(
            { error: error.details.map((d) => d.message) },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.next();
  }

  if (token && AUTH_PATHS.includes(pathname)) {
    if (token.role === 'admin') return NextResponse.redirect(new URL('/admin/products', req.url));

    if (token.role === 'user') return NextResponse.redirect(new URL('/', req.url));
  }

  if (!token) {
    const response = NextResponse.next();

    if (USER_PUBLIC_PATHS.includes(pathname) || ADMIN_PUBLIC_PATHS.includes(pathname)) {
      return response;
    }

    if (USER_PRIVATE_PATHS.some((path) => pathname.startsWith(path))) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (ADMIN_PRIVATE_PATHS.some((path) => pathname.startsWith(path))) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (token.role === 'user') {
    if (
      ADMIN_PRIVATE_PATHS.some((path) => pathname.startsWith(path))
      || ADMIN_PUBLIC_PATHS.includes(pathname)
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (token.role === 'admin') {
    if (
      USER_PRIVATE_PATHS.some((path) => pathname.startsWith(path))
      || USER_PUBLIC_PATHS.includes(pathname)
    ) {
      return NextResponse.redirect(new URL('/admin/products', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|images).*)']
};
