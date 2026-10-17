import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { clearAnnouncement, clearAllAnnouncements } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  const session = await auth();
  // ADJUST: property name, same as above
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body?.all === true) {
    await clearAllAnnouncements(userId);
    return NextResponse.json({ ok: true });
  }

  if (typeof body?.id === "string" && body.id) {
    await clearAnnouncement(userId, body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Provide id or all:true" },
    { status: 400 },
  );
}