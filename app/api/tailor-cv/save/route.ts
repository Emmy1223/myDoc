// app/api/tailor-cv/save/route.ts
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { createDocument, getDocument, updateDocument } from "@/lib/server-db";

export const runtime = "nodejs";

type SkillsChange = {
  original: string[];
  tailored: string[];
  movedToBottom: string[];
  added?: { skill: string; evidence: string; suggested: boolean }[];
};

type SummaryChange = {
  original: string;
  tailored: string;
};

type Report = {
  matchScore: number;
  companyName: string | null;
  roleTitle: string | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  summaryChange: SummaryChange | null;
  skillsChange: SkillsChange | null;
};

export async function POST(request: Request) {
  try {
    // ---- 1. Auth ----
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    // ---- 2. Parse input ----
    const body = (await request.json().catch(() => ({}))) as {
      sourceDocumentId?: string;
      report?: Report;
    };

    const sourceDocumentId = body.sourceDocumentId?.trim();
    const report = body.report;

    if (!sourceDocumentId) {
      return NextResponse.json(
        { error: "No source document specified." },
        { status: 400 },
      );
    }
    if (!report) {
      return NextResponse.json(
        { error: "No tailoring report provided." },
        { status: 400 },
      );
    }

    // ---- 3. Load the source CV ----
    const source = await getDocument(userId, sourceDocumentId);
    if (!source) {
      return NextResponse.json(
        { error: "Source document not found." },
        { status: 404 },
      );
    }

    const sourceContent = (source.content ?? {}) as Record<string, any>;

    // ---- 4. Apply tailored fields ----
       const tailoredContent = { ...sourceContent };

    if (report.summaryChange?.tailored) {
      tailoredContent.summary = stripAiMarkers(report.summaryChange.tailored);
    }
    if (report.skillsChange?.tailored?.length) {
      tailoredContent.skills = report.skillsChange.tailored.map((s) =>
        stripAiMarkers(s),
      );
    }
    // Clean the source title too, in case it already contains a marker
    if (typeof tailoredContent.title === "string") {
      tailoredContent.title = stripAiMarkers(tailoredContent.title);
    }

        // Use the person's name only for the document title (also becomes the PDF filename)
    const fullName =
      (sourceContent.fullName as string | undefined)?.trim() || "";
    const baseTitle = source.title.replace(/\s+—\s+.*$/i, "").trim();
    const newTitle = fullName || baseTitle || "Tailored CV";

    // ---- 6. Create the new document (a copy) ----
    const created = await createDocument({
      userId,
      title: newTitle,
      kind: "CV",
      templateId: source.templateId,
      status: "draft",
      sourceDocumentId: source.id,
    });

    // ---- 7. Update it with the tailored content ----
    const updated = await updateDocument(userId, created.id, {
      content: tailoredContent,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Could not save the tailored CV." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      document: {
        id: created.id,
        title: newTitle,
      },
    });
  } catch (error) {
    console.error("tailor-cv save error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function stripAiMarkers(text: string): string {
  return text
    // Parentheses
    .replace(/\s*\(\s*AI[\s-]*(?:Prompt|Assisted|Generated|Written)?\s*\)/gi, "")
    .replace(/\s*\(\s*Tailored(?:\s+by\s+AI)?\s*\)/gi, "")
    .replace(/\s*\(\s*Generated\s*\)/gi, "")
    .replace(/\s*\(\s*Auto[\s-]*generated\s*\)/gi, "")
    .replace(/\s*\(\s*GPT\s*\)/gi, "")
    .replace(/\s*\(\s*LLM\s*\)/gi, "")
    // Square brackets
    .replace(/\s*\[\s*AI[\s\S]{0,20}?\s*\]/gi, "")
    .replace(/\s*\[\s*Tailored[\s\S]{0,20}?\s*\]/gi, "")
    // Standalone suffixes after a hyphen or dash
    .replace(/\s*[—–-]\s*AI[\s-]*(?:Prompt|Assisted|Generated|Written)?\s*$/gim, "")
    .replace(/\s+/g, " ")
    .trim();
}