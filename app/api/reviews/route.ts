import { NextResponse } from "next/server";
import { getApprovedReviews, submitReview } from "@/lib/server-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await getApprovedReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      rating?: number;
      message?: string;
      name?: string;
      role?: string;
      email?: string;
    };

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 },
      );
    }

    const message = body.message?.trim() ?? "";
    if (!message) {
      return NextResponse.json(
        { error: "Review message is required." },
        { status: 400 },
      );
    }
    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message is too long. Maximum 1000 characters." },
        { status: 400 },
      );
    }

    const review = await submitReview({
      rating,
      message,
      name: body.name,
      role: body.role,
      email: body.email,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("submit review error:", error);
    return NextResponse.json(
      { error: "Could not submit review." },
      { status: 500 },
    );
  }
}