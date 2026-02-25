import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'pos_session';

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
    return new TextEncoder().encode(secret);
};

export interface SessionPayload {
    userId: number;
    username: string;
    role: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySession(token);
}
