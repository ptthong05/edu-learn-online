import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require login
  const protectedPaths = ['/admin', '/checkout', '/tai-khoan', '/profile', '/my-courses', '/affiliate'];

  // Skip checks for static assets, next internals, api, or file paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  console.log(`[Middleware] Path: ${pathname} | Token: ${token ? 'Yes' : 'No'} | Protected: ${isProtectedPath}`);

  // If user is not logged in and attempts to visit a protected route
  if (!token && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
