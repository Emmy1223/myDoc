import { NextResponse } from "next/server";
import { getUser } from "@/lib/server-db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  // ✅ Added `await` before getUser
  const user = userId ? await getUser(userId) : null;
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}