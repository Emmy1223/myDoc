"use client";

import { ArrowLeft, Sparkles, LoaderCircle, AlertCircle } from "lucide-react";

type DocumentItem = {
  id: string;
  title: string;
  kind: string;
  status: "draft" | "in-progress" | "completed";
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  exportCount: number;
};

const MIN_CHARS = 100;
const MAX_CHARS = 20000;

export default function PasteJdStep({
  document,
  jobDescription,
  setJobDescription,
  onBack,
  onAnalyze,
  analyzing,
  analyzeError,
}: {
  document: DocumentItem;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
  analyzing: boolean;
  analyzeError: string | null;
}) {
  const trimmed = jobDescription.trim();
  const charCount = trimmed.length;
  const tooShort = charCount < MIN_CHARS;
  const tooLong = charCount > MAX_CHARS;
  const canAnalyze = !tooShort && !tooLong && !analyzing;

  return (
    <div>
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Step 2 of 3
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
          Paste the job description
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          We will analyze this to understand what the role actually wants, then
          tailor your profile and skills accordingly.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border border-stone-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Source CV
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">
            {document.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          disabled={analyzing}
          className="shrink-0 border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          Change
        </button>
      </div>

      <div className="mt-6">
        <label
          htmlFor="job-description"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          Job description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={analyzing}
          rows={14}
          placeholder="Paste the full job description here. Include the role title, responsibilities, requirements, and any 'nice to have' skills."
          className="w-full resize-y border border-stone-300 bg-white px-3 py-2.5 text-sm leading-6 text-ink outline-none focus:border-rust placeholder:text-stone-400 disabled:bg-stone-50 disabled:text-stone-500"
        />
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-stone-500">
            {charCount < MIN_CHARS ? (
              <>Add at least {MIN_CHARS - charCount} more characters.</>
            ) : tooLong ? (
              <span className="text-red-700">
                Too long. Please trim to under {MAX_CHARS.toLocaleString()} characters.
              </span>
            ) : (
              <span className="text-stone-500">Ready to analyze.</span>
            )}
          </span>
          <span
            className={`font-mono tabular-nums ${
              tooLong ? "text-red-700" : "text-stone-400"
            }`}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      {analyzeError && (
        <div className="mt-4 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />
          <p className="text-sm leading-6 text-red-800">{analyzeError}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={analyzing}
          className="inline-flex items-center gap-2 border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="inline-flex items-center gap-2 bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {analyzing ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              Analyze and tailor
            </>
          )}
        </button>
      </div>
    </div>
  );
}