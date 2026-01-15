import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Por ahora, sin autenticación - solo pasar todas las requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
