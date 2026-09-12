import { NextResponse } from "next/server";
import {
  cloneMostRecentDocument,
  createDocument,
  type DocumentKind,
  type DocumentStatus,
} from "@/lib/server-db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: "create" | "clone-last";
      title?: string;
      kind?: DocumentKind;
      templateId?: string;
      status?: DocumentStatus;
    };

    if (body.action === "clone-last") {
      const document = await cloneMostRecentDocument(userId);
      if (!document) {
        return NextResponse.json(
          { error: "Create a document before cloning your last one." },
          { status: 404 },
        );
      }
      return NextResponse.json({ document }, { status: 201 });
    }

    const document = await createDocument({
      userId,
      title: body.title ?? "Untitled document",
      kind: body.kind,
      templateId: body.templateId,
      status: body.status,
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    console.error("create document error:", err);
    return NextResponse.json(
      { error: "The document could not be created." },
      { status: 400 },
    );
  }
}