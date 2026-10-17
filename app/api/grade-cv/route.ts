import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cvText, jobTitle } = body;

    if (!cvText || !jobTitle) {
      return NextResponse.json(
        { error: "CV text and job title are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured." }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and career coach. 
The user will provide their CV text and a target job title.
Analyze the CV against the job title.
Return ONLY a valid JSON object with this exact schema:
{
  "score": 75, // Integer 0-100
  "missingKeywords": ["React", "Agile"], // Array of strings: skills/methods they need to add
  "irrelevantContent": ["High School Diploma"], // Array of strings: things they should remove to save space
  "alternativeRoles": ["Frontend Developer", "UI Engineer"] // Array of strings: other job titles they are a good fit for
}`;

    const userPrompt = `Target Job Title: ${jobTitle}\n\nCV Text:\n${cvText.slice(0, 10000)}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const report = JSON.parse(raw);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Grade CV error:", error);
    return NextResponse.json({ error: "Failed to grade CV." }, { status: 500 });
  }
}