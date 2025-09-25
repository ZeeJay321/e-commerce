import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import dayjs from 'dayjs';
import { getToken } from 'next-auth/jwt';

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
const ADMIN_PRIVATE_PATHS = ['/admin/products', '/admin/orders', '/admin/order-details'];

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/admin/login'
];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('token', token);
  const { pathname } = req.nextUrl;

  if (token && AUTH_PATHS.includes(pathname)) {
    if (token.role === 'admin') return NextResponse.redirect(new URL('/admin/products', req.url));

    if (token.role === 'user') return NextResponse.redirect(new URL('/', req.url));
  }

  if (!token || (token.exp && dayjs(new Date()).isAfter(new Date(token.exp)))) {
    console.log('Token Expired here');

    console.log('Token Expired here');

    // Create response to delete cookies
    const response = NextResponse.next();
    const expiredDate = new Date(0).toUTCString();
    response.headers.set(
      'Set-Cookie',
      `next-auth.session-token=; Path=/; Expires=${expiredDate}; HttpOnly; Secure; SameSite=Lax`
    );
    response.headers.append(
      'Set-Cookie',
      `__Secure-next-auth.session-token=; Path=/; Expires=${expiredDate}; HttpOnly; Secure; SameSite=Lax`
    );

    if (USER_PUBLIC_PATHS.includes(pathname) || ADMIN_PUBLIC_PATHS.includes(pathname)) {
      return response;
    }

    if (USER_PRIVATE_PATHS.some((path) => pathname.startsWith(path))) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (ADMIN_PRIVATE_PATHS.some((path) => pathname.startsWith(path))) {
      const url = new URL('/admin/login', req.url);
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
  matcher: ['/((?!api|_next|static|favicon.ico|images).*)']
};
