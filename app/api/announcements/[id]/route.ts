import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteAnnouncement } from "@/lib/server-db";

function isAdmin(email: string | null | undefined) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Await the params promise to get the ID
  const { id } = await params;
  
  await deleteAnnouncement(id);
  return NextResponse.json({ ok: true });
}