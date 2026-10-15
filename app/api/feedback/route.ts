import { NextResponse } from "next/server";
import { submitFeedback } from "@/lib/server-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      message?: string;
      name?: string;
      email?: string;
      category?: string;
    };

    const message = body.message?.trim() ?? "";
    if (!message) {
      return NextResponse.json(
        { error: "Feedback message is required." },
        { status: 400 },
      );
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long. Maximum 2000 characters." },
        { status: 400 },
      );
    }

    const feedback = await submitFeedback({
      message,
      name: body.name,
      email: body.email,
      category: body.category,
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("submit feedback error:", error);
    return NextResponse.json(
      { error: "Could not submit feedback." },
      { status: 500 },
    );
  }
}