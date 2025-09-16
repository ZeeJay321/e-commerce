import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
const PRIVATE_PATHS = ['/', '/cart', '/orders', '/order-details'];
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (PRIVATE_PATHS.some((path) => pathname.startsWith(path))) {
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico|images).*)']
};
