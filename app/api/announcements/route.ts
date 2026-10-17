import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createAnnouncement,
  getAnnouncementsForUser,
  getAllAnnouncements,
} from "@/lib/server-db";

function isAdmin(email: string | null | undefined) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function GET() {
  const session = await auth();
  // ADJUST: property name — likely session.user.id based on your setup
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admins see everything; regular users see only what they haven't cleared
  if (isAdmin(session?.user?.email)) {
    const items = await getAllAnnouncements();
    return NextResponse.json({ items });
  }

  const items = await getAnnouncementsForUser(userId);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title : "";
  const text = typeof body?.body === "string" ? body.body : "";
  const url = typeof body?.url === "string" ? body.url : null;

  if (!title.trim() || !text.trim()) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  const announcement = await createAnnouncement({ title, body: text, url });
  return NextResponse.json({ announcement });
}