import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const sessionCookieName = "mydoc_session";
const sessionSecret = process.env.MYDOC_SESSION_SECRET ?? "mydoc-local-session-secret";

function signature(userId: string) {
  return createHmac("sha256", sessionSecret).update(userId).digest("base64url");
}

export function createSessionValue(userId: string) {
  return `${Buffer.from(userId).toString("base64url")}.${signature(userId)}`;
}

export function readSessionValue(value?: string) {
  if (!value) return null;
  const [encodedUserId, providedSignature] = value.split(".");
  if (!encodedUserId || !providedSignature) return null;

  const userId = Buffer.from(encodedUserId, "base64url").toString("utf8");
  const expectedSignature = signature(userId);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }
  return userId;
}

/**
 * Get the current user id from either:
 *  1. Our custom `mydoc_session` cookie (email/password flow)
 *  2. Auth.js's session (Google sign-in flow)
 */
export async function getSessionUserId(): Promise<string | null> {
  // Try our custom cookie first
  const cookieStore = await cookies();
  const fromCustomCookie = readSessionValue(cookieStore.get(sessionCookieName)?.value);
  if (fromCustomCookie) return fromCustomCookie;

  // Fall back to Auth.js session (Google sign-in)
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(sessionCookieName, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}