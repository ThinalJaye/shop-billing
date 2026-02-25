import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from '@/lib/auth';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    let isAuthenticated = false;
    if (token) {
        try {
            await jwtVerify(token, getSecret());
            isAuthenticated = true;
        } catch {
            isAuthenticated = false;
        }
    }

    // If at /login and already logged in → redirect to POS
    if (pathname === '/login') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // All other matched routes → require auth
    if (!isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/inventory/:path*', '/admin/:path*', '/login'],
};
