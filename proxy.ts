import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'tutornova_super_secret_jwt_key_2026',
  });

  // 1. Protect /adminpanel routes (except /adminpanel/login)
  if (pathname.startsWith('/adminpanel') && pathname !== '/adminpanel/login') {
    if (!token || token.role !== 'admin') {
      const loginUrl = new URL('/adminpanel/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect /dashboard and /learn routes for authenticated students
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/learn')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/adminpanel/:path*', '/dashboard/:path*', '/learn/:path*'],
};
