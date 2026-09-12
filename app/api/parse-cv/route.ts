// app/api/parse-cv/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 60; // allow up to 60s for slow parses on Vercel

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Section IDs we want in the response, in default order
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

const SYSTEM_PROMPT = `You are a CV parsing assistant. You receive raw text extracted from a resume and return structured data as JSON.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown code fences, no explanations, no preamble, no trailing text.
2. If a field is not present in the CV, use an empty string "" or empty array [].
3. Preserve the original casing and wording of text from the CV. Do not rewrite or "improve" it.
4. For dates, prefer the format used in the CV. If ambiguous, use "YYYY" or "Mon YYYY".
5. Bullets must be one array entry per bullet. Strip leading bullet characters ("-", "•", "*").
6. If two roles appear on one line (e.g., "Frontend Engineer – Lean, VA"), split them: role="Frontend Engineer", company="Lean", location="VA".
7. Group all bullets under the role they describe.
8. If a section header exists (e.g., "PROFESSIONAL EXPERIENCE") but has no bullets below it, ignore it — do not create an experience entry for it.
9. Skills: split on commas, semicolons, or pipe characters. Trim each.`;

const SCHEMA_PROMPT = `Return a JSON object with EXACTLY this shape:

{
  "fullName": string,
  "title": string,
  "email": string,
  "phone": string,
  "location": string,
  "website": string,
  "summary": string,
  "experience": [
    {
      "role": string,
      "company": string,
      "location": string,
      "start": string,
      "end": string,
      "bullets": string[]
    }
  ],
  "education": [
    {
      "degree": string,
      "school": string,
      "start": string,
      "end": string,
      "detail": string
    }
  ],
  "skills": string[]
}`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    // Cap input length to avoid runaway costs (Groq is free but be a good citizen)
    const truncated = text.length > 20000 ? text.slice(0, 20000) : text;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.1, // low temp = more consistent JSON
      max_completion_tokens: 4000,
      response_format: { type: "json_object" }, // force JSON mode
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${SCHEMA_PROMPT}\n\nCV TEXT:\n"""\n${truncated}\n"""`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    if (!raw) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 },
      );
    }

    // Parse the JSON. If it fails, return the raw text for debugging.
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Sometimes the model wraps JSON in code fences despite instructions
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse model JSON:", raw.slice(0, 500));
        return NextResponse.json(
          { error: "Model returned invalid JSON." },
          { status: 502 },
        );
      }
    }

    // Add id + sectionOrder so it matches our CVData shape
    const experience = (parsed.experience ?? []).map((e: any, i: number) => ({
      id: `exp-${Date.now()}-${i}`,
      role: e.role ?? "",
      company: e.company ?? "",
      location: e.location ?? "",
      start: e.start ?? "",
      end: e.end ?? "",
      bullets: Array.isArray(e.bullets) ? e.bullets.join("\n") : "",
    }));

    const education = (parsed.education ?? []).map((e: any, i: number) => ({
      id: `edu-${Date.now()}-${i}`,
      degree: e.degree ?? "",
      school: e.school ?? "",
      start: e.start ?? "",
      end: e.end ?? "",
      detail: e.detail ?? "",
    }));

    const result = {
      fullName: parsed.fullName ?? "",
      title: parsed.title ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      location: parsed.location ?? "",
      website: parsed.website ?? "",
      summary: parsed.summary ?? "",
      experience,
      education,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      // Empty new sections
      languages: [],
      certificates: [],
      projects: [],
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

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("parse-cv error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}