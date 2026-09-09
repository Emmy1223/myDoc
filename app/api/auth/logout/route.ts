import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Build the redirect response first...
  const response = NextResponse.redirect(new URL("/dashboard", request.url), {
    status: 303, // ensures the browser follows up with a GET, not a re-POST
  });

  // ...then clear the session cookie on that same response object,
  // so the Set-Cookie header rides along with the redirect.
  clearSessionCookie(response);

  return response;
}
