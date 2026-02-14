import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'loop_docs_admin';
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionConfig = {
    username: string;
    password: string;
    secret: string;
    ttlSeconds: number;
};

function getConfig(): SessionConfig {
    const username = process.env.DOCS_ADMIN_USERNAME ?? 'admin';
    const password = process.env.DOCS_ADMIN_PASSWORD ?? 'admin';
    const secret =
        process.env.DOCS_ADMIN_SECRET ??
        process.env.NEXTAUTH_SECRET ??
        'replace-me-in-env';
    const ttlSeconds =
        Number(process.env.DOCS_ADMIN_SESSION_TTL_SECONDS) ||
        DEFAULT_SESSION_TTL_SECONDS;

    return { username, password, secret, ttlSeconds };
}

function sign(payload: string, secret: string) {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createSessionToken(username: string) {
    const { secret, ttlSeconds } = getConfig();
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    const payload = Buffer.from(
        JSON.stringify({
            username,
            expiresAt,
            nonce: randomUUID(),
        }),
        'utf8'
    ).toString('base64url');
    const signature = sign(payload, secret);
    return `${payload}.${signature}`;
}

function verifySessionToken(token: string) {
    const { secret } = getConfig();
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const payload = parts[0];
    const signature = parts[1];
    if (!signature || !payload) return false;

    const expected = sign(payload, secret);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length) return false;
    if (!timingSafeEqual(actualBuffer, expectedBuffer)) return false;

    let parsedPayload: { expiresAt?: number } | null = null;
    try {
        parsedPayload = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf8')
        ) as { expiresAt?: number };
    } catch {
        return false;
    }

    const expiresAt = Number(parsedPayload.expiresAt);
    if (!Number.isFinite(expiresAt)) return false;
    return expiresAt > Math.floor(Date.now() / 1000);
}

export function validateAdminCredentials(username: string, password: string) {
    const config = getConfig();
    return username === config.username && password === config.password;
}

export async function setAdminSession() {
    const cookieStore = await cookies();
    const config = getConfig();
    const token = createSessionToken(config.username);

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: config.ttlSeconds,
    });
}

export async function clearAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return false;
    return verifySessionToken(token);
}

export async function requireAdmin() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        throw new Error('Unauthorized');
    }
}
