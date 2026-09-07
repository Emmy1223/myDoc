import { NextResponse } from "next/server";
import { authenticateUser, registerUser } from "@/lib/server-db";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "signin" | "signup";
      name?: string;
      email?: string;
      password?: string;
    };
    const mode = body.mode ?? "signin";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Use a password with at least 8 characters." },
        { status: 400 },
      );
    }
    if (mode === "signup" && !body.name?.trim()) {
      return NextResponse.json(
        { error: "Your name is required when creating an account." },
        { status: 400 },
      );
    }

    const result =
      mode === "signup"
        ? registerUser({ name: body.name?.trim() ?? "", email, password })
        : authenticateUser({ email, password });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    if (!result.user) {
      return NextResponse.json({ error: "Unable to create a session." }, { status: 500 });
    }
    if (mode === "signup" && !result.user.name) {
      return NextResponse.json(
        { error: "Your name is required when creating an account." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
    setSessionCookie(response, result.user.id);
    return response;
  } catch {
    return NextResponse.json({ error: "The request could not be completed." }, { status: 400 });
  }
}
