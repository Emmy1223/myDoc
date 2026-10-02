import Link from "next/link";
import { Upload, ClipboardCheck, FileDown, FileEdit } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your file",
    body: "Drop in a PDF or DOCX. We read the raw text and pull out your name, roles, education, and skills automatically. No copying and pasting field by field.",
    image: "/step-upload.png",
    alt: "Uploading a CV to myDoc",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Review the extracted data",
    body: "Every mapped field lands in the editor already filled. Check it, fix anything, and watch the preview update as you type.",
    image: "/step-review.png",
    alt: "Reviewing extracted CV data in the myDoc editor",
  },
  {
    number: "03",
    icon: FileDown,
    title: "Export to PDF",
    body: "Pick a template, switch layouts with one click, and download a print-ready A4 document. Your formatting stays exactly where you left it.",
    image: "/step-export.png",
    alt: "Exporting the finished CV to PDF from myDoc",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            How it works
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
            Three steps from old CV to tailored PDF
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-600">
            Importing an existing CV? This is the flow. Starting a document
            from scratch? Skip to the writing editor.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex flex-col border border-stone-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-extrabold leading-none tracking-tightish text-rust">
                    {step.number}
                  </span>
                  <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                </div>

                <h3 className="mt-6 font-display text-xl font-bold tracking-tightish text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {step.body}
                </p>

                <div className="mt-6 aspect-[4/3] overflow-hidden border border-stone-200 bg-stone-50">
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>

      
        <div className="mt-12 border border-stone-200 bg-white p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-stone-200 bg-stone-50">
                <FileEdit
                  className="h-5 w-5 text-stone-600"
                  strokeWidth={1.75}
                />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold tracking-tightish text-ink">
                  Writing something else?
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">
                  Project briefs, reports, meeting notes, or a blank page.
                  Open the writing editor and start typing - no upload
                  required.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/write"
              className="inline-flex shrink-0 items-center gap-2 border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
            >
              <FileEdit className="h-4 w-4" strokeWidth={2} />
              Open the editor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}