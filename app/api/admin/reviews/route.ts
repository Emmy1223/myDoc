import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllReviews, getReviewStats } from "@/lib/server-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const [items, stats] = await Promise.all([
    getAllReviews(),
    getReviewStats(),
  ]);

  return NextResponse.json({ items, stats });
}