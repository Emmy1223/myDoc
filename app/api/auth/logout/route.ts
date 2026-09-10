import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Build the redirect response first...
  const response = NextResponse.redirect(new URL("/dashboard", request.url), {
    status: 303, 
  });

  clearSessionCookie(response);

  return response;
}
