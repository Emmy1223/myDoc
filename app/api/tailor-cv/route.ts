// app/api/tailor-cv/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSessionUserId } from "@/lib/session";
import { getDocument } from "@/lib/server-db";
import {
  TAILOR_SYSTEM_PROMPT,
  buildTailorUserPrompt,
} from "@/lib/tailor-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

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
      documentId?: string;
      jobDescription?: string;
    };

    const documentId = body.documentId?.trim();
    const jobDescription = body.jobDescription?.trim();

    if (!documentId) {
      return NextResponse.json(
        { error: "No source document specified." },
        { status: 400 },
      );
    }
    if (!jobDescription || jobDescription.length < 100) {
      return NextResponse.json(
        { error: "Job description is too short. Paste at least 100 characters." },
        { status: 400 },
      );
    }

    // ---- 3. Load the CV ----
    const document = await getDocument(userId, documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Source document not found." },
        { status: 404 },
      );
    }

    const cv = (document.content ?? {}) as {
      summary?: string;
      skills?: string[];
      experience?: { role?: string; company?: string; bullets?: string }[];
    };

    const summary = cv.summary ?? "";
    const skills = Array.isArray(cv.skills) ? cv.skills : [];
    const experience = Array.isArray(cv.experience) ? cv.experience : [];

    // ---- 4. Validate the CV has enough to tailor ----
    if (!summary && skills.length === 0 && experience.length === 0) {
      return NextResponse.json(
        {
          error:
            "This CV has no content to tailor. Add a summary, skills, or experience first.",
        },
        { status: 400 },
      );
    }
    if (experience.length === 0) {
      return NextResponse.json(
        {
          error:
            "This CV has no experience entries. Add at least one role before tailoring.",
        },
        { status: 400 },
      );
    }

    // ---- 5. Groq key check ----
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured on the server." },
        { status: 500 },
      );
    }

    // ---- 6. Build prompt ----
    const experienceForPrompt = experience.map((e) => ({
      role: e.role ?? "",
      company: e.company ?? "",
      bullets: e.bullets ?? "",
    }));

    const userPrompt = buildTailorUserPrompt({
      cvSummary: summary,
      cvSkills: skills,
      cvExperience: experienceForPrompt,
      jobDescription:
        jobDescription.length > 12000
          ? jobDescription.slice(0, 12000)
          : jobDescription,
    });

    // ---- 7. Call Groq ----
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      max_completion_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TAILOR_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    if (!raw) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Try again." },
        { status: 502 },
      );
    }

    // ---- 8. Parse the response ----
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("Tailor: invalid JSON from model:", raw.slice(0, 500));
        return NextResponse.json(
          { error: "The AI returned invalid data. Try again." },
          { status: 502 },
        );
      }
    }

    // ---- 9. Normalize ----
    const report = {
      matchScore: clampScore(parsed.matchScore),
      companyName: sanitizeString(parsed.companyName),
      roleTitle: sanitizeString(parsed.roleTitle),
      matchedKeywords: sanitizeKeywords(parsed.matchedKeywords),
      missingKeywords: sanitizeKeywords(parsed.missingKeywords),
      summaryChange: sanitizeSummaryChange(parsed.summaryChange, summary),
      skillsChange: sanitizeSkillsChange(parsed.skillsChange, skills),
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error("tailor-cv error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---- Helpers ----

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function sanitizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length < 60)
    .slice(0, 40);
}

function sanitizeSummaryChange(value: unknown, fallbackOriginal: string) {
  if (!value || typeof value !== "object") return null;
  const v = value as { original?: unknown; tailored?: unknown };
  const original =
    typeof v.original === "string" ? v.original : fallbackOriginal;
  const tailored = typeof v.tailored === "string" ? v.tailored : "";
  if (!tailored.trim()) return null;
  return { original, tailored };
}

function sanitizeSkillsChange(value: unknown, fallbackOriginal: string[]) {
  if (!value || typeof value !== "object") return null;
  const v = value as {
    original?: unknown;
    tailored?: unknown;
    movedToBottom?: unknown;
    added?: unknown;
  };

  const original = Array.isArray(v.original)
    ? v.original.filter((s): s is string => typeof s === "string")
    : fallbackOriginal;

  const tailored = Array.isArray(v.tailored)
    ? v.tailored.filter((s): s is string => typeof s === "string")
    : [];

  const movedToBottom = Array.isArray(v.movedToBottom)
    ? v.movedToBottom.filter((s): s is string => typeof s === "string")
    : [];

  const added = Array.isArray(v.added)
    ? v.added
        .filter(
          (a: any) =>
            a && typeof a.skill === "string" && typeof a.evidence === "string",
        )
        .map((a: any) => ({
          skill: a.skill.trim(),
          evidence: a.evidence.trim(),
          suggested: Boolean(a.suggested),
        }))
        .filter((a: any) => a.skill.length > 0)
    : [];

  if (tailored.length === 0) return null;
  return { original, tailored, movedToBottom, added };
}