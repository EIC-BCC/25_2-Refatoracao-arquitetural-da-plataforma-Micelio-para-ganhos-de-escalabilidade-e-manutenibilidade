import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*','/groups/:path*'], // 👈 protected routes
};

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;

  // If there's no token, redirect to /sign
  if (!token) {
    return NextResponse.redirect(new URL('/sign', req.url));
  }

  try {
    // Verify token using your existing backend endpoint
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!verifyResponse.ok) {
      return NextResponse.redirect(new URL('/sign', req.url));
    }

    // Token is valid → allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/sign', req.url));
  }
}
