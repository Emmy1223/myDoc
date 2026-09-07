import { NextResponse } from "next/server";
import {
  deleteDocument,
  duplicateDocument,
  exportDocument,
  getDocument,
  updateDocument,
} from "@/lib/server-db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const document = getDocument(userId, id);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return NextResponse.json({ document });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    templateId?: string;
    status?: "draft" | "in-progress" | "completed";
    content?: Record<string, unknown>;
  };
  const document = updateDocument(userId, id, body);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return NextResponse.json({ document });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action === "duplicate") {
    const document = duplicateDocument(userId, id);
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    return NextResponse.json({ document }, { status: 201 });
  }
  if (body.action === "export") {
    const document = exportDocument(userId, id);
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    return NextResponse.json({ document });
  }
  return NextResponse.json({ error: "Unsupported document action." }, { status: 400 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const document = deleteDocument(userId, id);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return NextResponse.json({ document });
}