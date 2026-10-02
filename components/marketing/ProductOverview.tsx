import { Check } from "lucide-react";

const BULLETS = [
  "Upload PDF or Word CVs",
  "AI parsing with local fallback",
  "Tailor to any job description",
  "CV templates for every application",
  "Document templates: briefs, reports, notes",
  "Rich-text editor - headings, lists, links",
  "Auto-fit to two pages",
  "ATS-friendly black and white output",
  "Export as a clean PDF",
  "Autosave across every device",
  "Free forever, no card required",
];

export default function ProductOverview() {
  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          What myDoc does
        </p>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
          One workspace for CVs and everything else
        </h2>

        <p className="mt-8 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
          myDoc handles two jobs at once. It takes the CV you already have and
          makes it work for the specific job you are applying for parsing
          with AI, rewriting your profile and skills to match the role, and
          exporting a clean, ATS-friendly PDF. And when you need to write
          something else a project brief, a report, meeting notes, or just a
          blank page - the same workspace is a full writing editor. We never
          fabricate. We never invent. Everything you write is yours.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {BULLETS.map((bullet) => (
            <div
              key={bullet}
              className="flex items-center gap-3 border border-stone-200 bg-paper px-4 py-3"
            >
              <Check className="h-4 w-4 shrink-0 text-rust" strokeWidth={2.5} />
              <span className="text-sm font-medium text-ink">{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}