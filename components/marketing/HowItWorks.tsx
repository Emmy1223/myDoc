import { Upload, ClipboardCheck, FileDown } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your file.",
    body: "Drop in a PDF or DOCX. We read the raw text and pull out your name, roles, education, and skills — no copying and pasting field by field.",
  },
  {
    icon: ClipboardCheck,
    title: "Review the extracted data.",
    body: "Every mapped field lands in the editor already filled. Check it, fix anything, and watch the preview update as you type.",
  },
  {
    icon: FileDown,
    title: "Export to PDF.",
    body: "Pick a template, switch layouts with one click, and download a print-ready A4 document. Your formatting stays exactly where you left it.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-5 md:py-28">
        {/* Left: sticky heading (40%) */}
        <div className="md:col-span-2">
          <div className="md:sticky md:top-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              How it works
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.15] tracking-tightish text-ink">
              Three steps to a finished document.
            </h2>
          </div>
        </div>

        {/* Right: vertical list of three steps (60%) */}
        <div className="md:col-span-3">
          <ol>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={i}
                  className="flex gap-6 border-t border-stone-200 py-10 first:border-t-0 first:pt-0"
                >
                  <span className="font-display text-5xl font-extrabold leading-none tracking-tightish text-rust md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-2">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                      <h3 className="font-display text-xl font-bold tracking-tightish text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-md text-[15px] leading-7 text-stone-600">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
