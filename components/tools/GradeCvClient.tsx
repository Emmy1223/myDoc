"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  Loader2,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";

type Report = {
  score: number;
  missingKeywords: string[];
  irrelevantContent: string[];
  alternativeRoles: string[];
};

type DocItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function GradeCvClient({
  initialDocuments,
}: {
  initialDocuments: DocItem[];
}) {
  const [jobTitle, setJobTitle] = useState("");

  // Default to "existing" if they have documents, otherwise default to "upload"
  const [sourceType, setSourceType] = useState<"upload" | "existing">(
    initialDocuments.length > 0 ? "existing" : "upload",
  );

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Existing docs state
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocuments.length > 0 ? initialDocuments[0].id : "",
  );

  // Grading state
  const [grading, setGrading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract text from uploaded files
  async function extractTextFromFile(file: File): Promise<string> {
    if (file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    } else if (file.name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    return await file.text();
  }

  // Helper to flatten either a Tiptap Document OR a standard CV JSON into plain text
  function flattenDocContent(docContent: any): string {
    if (!docContent) return "";

    // 1. Check if it's a standard CV built with the CV Builder
    if (docContent.fullName || docContent.experience) {
      let text = "";
      if (docContent.fullName) text += `Name: ${docContent.fullName}\n`;
      if (docContent.title) text += `Title: ${docContent.title}\n`;
      if (docContent.email) text += `Email: ${docContent.email}\n`;
      if (docContent.phone) text += `Phone: ${docContent.phone}\n`;
      if (docContent.location) text += `Location: ${docContent.location}\n`;
      if (docContent.website) text += `Website: ${docContent.website}\n`;
      if (docContent.summary) text += `\nSummary:\n${docContent.summary}\n`;

      if (docContent.experience && Array.isArray(docContent.experience)) {
        text += `\nExperience:\n`;
        docContent.experience.forEach((exp: any) => {
          text += `${exp.role} at ${exp.company} (${exp.start} - ${exp.end})\n`;
          if (exp.bullets) text += `${exp.bullets}\n`;
        });
      }

      if (docContent.education && Array.isArray(docContent.education)) {
        text += `\nEducation:\n`;
        docContent.education.forEach((ed: any) => {
          text += `${ed.degree} at ${ed.school} (${ed.start} - ${ed.end})\n`;
          if (ed.detail) text += `${ed.detail}\n`;
        });
      }

      if (docContent.skills && Array.isArray(docContent.skills)) {
        text += `\nSkills:\n${docContent.skills.join(", ")}\n`;
      }

      return text.trim();
    }

    // 2. Check if it's a Tiptap Document built with the Write editor
    if (docContent.doc && docContent.doc.content) {
      const extractText = (node: any): string => {
        if (node.type === "text") return node.text + " ";
        if (node.content) return node.content.map(extractText).join("");
        return "";
      };
      return docContent.doc.content.map(extractText).join("\n").trim();
    }

    // 3. Fallback: If it's something else, stringify it (the AI might still be able to read it)
    return JSON.stringify(docContent);
  }

  async function handleGrade() {
    if (!jobTitle.trim()) return;
    if (sourceType === "upload" && !file) return;
    if (sourceType === "existing" && !selectedDocId) return;

    setGrading(true);
    setError(null);
    setReport(null);

    try {
      let textToGrade = "";

      if (sourceType === "upload" && file) {
        textToGrade = await extractTextFromFile(file);
      } else {
        // Fetch the selected document's content
        const res = await fetch(`/api/documents/${selectedDocId}`);
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load document.");
        textToGrade = flattenDocContent(data.document.content);
      }

      if (!textToGrade.trim()) {
        throw new Error(
          sourceType === "upload"
            ? "We couldn't read any text from this PDF. PDFs exported from our builder are often flattened by the browser during download. Please select one of your saved documents instead."
            : "This document appears to be empty. Please add some text to it first.",
        );
      }

      const res = await fetch("/api/grade-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: textToGrade, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade CV");
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGrading(false);
    }
  }

  // Reset state after viewing a report
  const handleReset = () => {
    setReport(null);
    setFile(null);
    setJobTitle("");
    setError(null);
  };

  const hasDocs = initialDocuments.length > 0;

  return (
    <div className="mx-auto max-w-3xl py-10 px-4 md:px-0">
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Instant Feedback
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightish text-ink">
          Grade your CV
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Type the job title you want. We'll scan your CV instantly and tell you
          exactly how to match it. Nothing is saved.
        </p>
      </div>

      {!report ? (
        <div className="space-y-6 border border-stone-200 bg-white p-6">
          {/* Job Title Input */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Target Job Title
            </label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Product Designer, Frontend Engineer"
              className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:border-rust outline-none"
            />
          </div>

          {/* CV Source Toggle */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Select your CV
            </label>
            <div className="flex border border-stone-200 bg-stone-50 p-1 mb-4">
              <button
                onClick={() => setSourceType("existing")}
                disabled={!hasDocs}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                  sourceType === "existing"
                    ? "bg-white text-ink shadow-sm border border-stone-200"
                    : "text-stone-500 hover:text-ink disabled:opacity-50"
                }`}
              >
                From my documents
              </button>
              <button
                onClick={() => setSourceType("upload")}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                  sourceType === "upload"
                    ? "bg-white text-ink shadow-sm border border-stone-200"
                    : "text-stone-500 hover:text-ink"
                }`}
              >
                Upload a file
              </button>
            </div>

            {/* Existing Documents Dropdown */}
            {sourceType === "existing" && (
              <div>
                {!hasDocs ? (
                  <div className="text-sm text-stone-500 py-2">
                    You don't have any saved documents yet. Switch to "Upload a
                    file".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-stone-200 p-2">
                    {initialDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full flex items-center justify-between p-3 text-left transition-colors border ${
                          selectedDocId === doc.id
                            ? "border-rust bg-orange-50"
                            : "border-transparent hover:bg-stone-50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink truncate">
                            {doc.title}
                          </p>
                          <p className="text-xs text-stone-500">
                            Updated{" "}
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedDocId === doc.id && (
                          <CheckCircle2 className="h-4 w-4 text-rust shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upload Dropzone */}
            {sourceType === "upload" && (
              <div
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed p-8 cursor-pointer transition-colors ${file ? "border-rust bg-orange-50" : "border-stone-300 hover:border-stone-400"}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-rust mb-2" />
                    <p className="font-semibold text-ink">{file.name}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-stone-400 mb-2" />
                    <p className="font-semibold text-ink">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      PDF or DOCX up to 10MB
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleGrade}
            disabled={
              !jobTitle.trim() ||
              (sourceType === "upload" && !file) ||
              (sourceType === "existing" && !selectedDocId) ||
              grading
            }
            className="w-full flex items-center justify-center gap-2 bg-rust py-3 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {grading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {grading ? "Analyzing..." : "Grade my CV"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border border-stone-200 bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Match Score
              </p>
              <p className="font-display text-5xl font-extrabold text-ink">
                {report.score}
                <span className="text-2xl text-stone-400">/100</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm font-semibold text-stone-500 hover:text-ink underline"
            >
              Grade another
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-red-200 bg-red-50 p-5">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Add these to match
              </h3>
              <ul className="space-y-1">
                {report.missingKeywords.map((kw) => (
                  <li key={kw} className="text-sm text-red-900">
                    • {kw}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-stone-200 bg-stone-50 p-5">
              <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Remove to save space
              </h3>
              <ul className="space-y-1">
                {report.irrelevantContent.map((kw) => (
                  <li key={kw} className="text-sm text-stone-600">
                    • {kw}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Other roles you should apply for
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.alternativeRoles.map((role) => (
                <span
                  key={role}
                  className="bg-white border border-blue-200 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
