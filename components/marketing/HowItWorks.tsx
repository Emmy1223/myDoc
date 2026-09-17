import { Upload, ClipboardCheck, FileDown } from "lucide-react";

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
      </div>
    </section>
  );
}