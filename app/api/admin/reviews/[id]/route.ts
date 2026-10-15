import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveReview, deleteReview } from "@/lib/server-db";

export const runtime = "nodejs";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function requireAdmin() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) return null;
  return userEmail;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    isApproved?: boolean;
  };

  if (typeof body.isApproved !== "boolean") {
    return NextResponse.json(
      { error: "isApproved must be a boolean." },
      { status: 400 },
    );
  }

  await approveReview(id, body.isApproved);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await deleteReview(id);
  return NextResponse.json({ ok: true });
}