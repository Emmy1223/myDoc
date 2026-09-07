import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/server-db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const category = new URL(request.url).searchParams.get("category") ?? undefined;
  const dashboard = getDashboardData(userId, category);
  if (!dashboard) {
    return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });
  }
  return NextResponse.json(dashboard);
}