import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import {
  disableSharing,
  enableSharing,
  getSharingStatus,
  regenerateShareToken,
} from "@/lib/server-db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const status = await getSharingStatus(userId, id);
  if (!status) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  return NextResponse.json(status);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "enable" | "disable" | "regenerate";
  };

  if (body.action === "disable") {
    const result = await disableSharing(userId, id);
    if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    return NextResponse.json(result);
  }

  if (body.action === "regenerate") {
    const result = await regenerateShareToken(userId, id);
    if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    return NextResponse.json(result);
  }

  const result = await enableSharing(userId, id);
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return NextResponse.json(result);
}