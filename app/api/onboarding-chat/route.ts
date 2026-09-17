// app/api/onboarding-chat/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/onboarding-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "certificates",
  "projects",
  "publications",
  "courses",
  "organizations",
  "interests",
  "references",
  "awards",
  "declaration",
  "custom",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

function tryParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJSON(raw: string): any | null {
  // 1. Direct parse
  let parsed = tryParse(raw);
  if (parsed) return parsed;

  // 2. Strip code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  parsed = tryParse(cleaned);
  if (parsed) return parsed;

  // 3. Find first { ... last }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last > first) {
    parsed = tryParse(raw.slice(first, last + 1));
    if (parsed) return parsed;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 },
      );
    }

    // Count how many times the user has replied — used to force the draft
    const userTurns = messages.filter((m) => m.role === "user").length;
    const shouldForceDraft = userTurns >= 6;

    // If we're forcing a draft, append a system nudge
    const extraSystem = shouldForceDraft
      ? "\n\nIMPORTANT: The user has answered enough questions. You MUST return the draft JSON now. No more questions."
      : "";

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.4,
      max_completion_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: ONBOARDING_SYSTEM_PROMPT + extraSystem,
        },
        ...messages,
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    if (!raw) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 },
      );
    }

    const parsed = extractJSON(raw);

    // Fallback: model returned plain text — treat it as the next question
    if (!parsed) {
      const fallbackText = raw.trim();
      if (fallbackText.length > 0 && fallbackText.length < 500) {
        return NextResponse.json({
          type: "question",
          content: fallbackText,
        });
      }
      console.error("Failed to parse onboarding JSON:", raw.slice(0, 500));
      return NextResponse.json(
        { error: "Model returned unparseable output." },
        { status: 502 },
      );
    }

    if (parsed.type === "question") {
      const content = String(parsed.content ?? "").trim();
      if (!content) {
        return NextResponse.json(
          { error: "Model returned an empty question." },
          { status: 502 },
        );
      }
      return NextResponse.json({ type: "question", content });
    }

    if (parsed.type === "draft") {
      const d = parsed.data ?? {};
      const now = Date.now();

      const experience = (d.experience ?? []).map((e: any, i: number) => ({
        id: `exp-${now}-${i}`,
        role: e.role ?? "",
        company: e.company ?? "",
        location: e.location ?? "",
        start: e.start ?? "",
        end: e.end ?? "",
        bullets: Array.isArray(e.bullets)
          ? e.bullets.filter(Boolean).join("\n")
          : typeof e.bullets === "string"
            ? e.bullets
            : "",
      }));

      const education = (d.education ?? []).map((e: any, i: number) => ({
        id: `edu-${now}-${i}`,
        degree: e.degree ?? "",
        school: e.school ?? "",
        start: e.start ?? "",
        end: e.end ?? "",
        detail: e.detail ?? "",
      }));

      const projects = (d.projects ?? []).map((p: any, i: number) => ({
        id: `proj-${now}-${i}`,
        name: p.name ?? "",
        description: p.description ?? "",
        role: p.role ?? "",
        technologies: p.technologies ?? "",
        link: p.link ?? "",
      }));

      const draft = {
        fullName: d.fullName ?? "",
        title: d.title ?? "",
        email: d.email ?? "",
        phone: d.phone ?? "",
        location: d.location ?? "",
        website: d.website ?? "",
        summary: d.summary ?? "",
        experience,
        education,
        skills: Array.isArray(d.skills) ? d.skills.filter(Boolean) : [],
        languages: [],
        certificates: [],
        projects,
        publications: [],
        courses: [],
        organizations: [],
        interests: [],
        references: [],
        awards: [],
        declaration: [],
        custom: [],
        sectionOrder: DEFAULT_SECTION_ORDER,
      };

      return NextResponse.json({ type: "draft", data: draft });
    }

    // Unknown type — treat as question if there's text, else error
    if (typeof parsed.content === "string" && parsed.content.trim()) {
      return NextResponse.json({
        type: "question",
        content: parsed.content.trim(),
      });
    }

    return NextResponse.json(
      { error: "Unexpected response shape from model." },
      { status: 502 },
    );
  } catch (error) {
    console.error("onboarding-chat error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}