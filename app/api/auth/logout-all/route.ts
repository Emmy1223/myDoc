// app/api/auth/logout-all/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  // Clear our custom session cookie
  cookieStore.delete(sessionCookieName);

  // Clear Auth.js's session cookies (both secure and non-secure variants)
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("__Secure-authjs.session-token");
  cookieStore.delete("authjs.csrf-token");
  cookieStore.delete("__Host-authjs.csrf-token");
  cookieStore.delete("authjs.callback-url");
  cookieStore.delete("__Secure-authjs.callback-url");

  // Redirect to login
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}