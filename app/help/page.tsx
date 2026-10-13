import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  PenLine,
  Share2,
  Smartphone,
  Upload,
  Sparkles,
  Search,
  FileOutput,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help - myDoc",
};

const SECTIONS = [
  {
    icon: FileText,
    title: "Build a CV",
    steps: [
      "From the dashboard, click New Document, then pick CV.",
      "Upload an existing PDF or Word CV, or start from scratch.",
      "If you upload, AI extracts your experience and structures it into fields.",
      "Edit anything in the Content tab. Choose a template in the Templates tab.",
      "Click Download PDF when you are ready. Give your CV a name first.",
    ],
  },
  {
    icon: PenLine,
    title: "Write a document",
    steps: [
      "From the dashboard, click New Document, then pick Document.",
      "Choose a template: Blank, Project Brief, Report, Meeting Notes, or Invoice.",
      "Type in the editor. Format with the toolbar at the top.",
      "Everything autosaves. Use Save anytime to flush immediately.",
      "Download as PDF from the top bar when you are done.",
    ],
  },
  {
    icon: Share2,
    title: "Share a CV or document",
    steps: [
      "Open the dashboard and find the document you want to share.",
      "Click the three dots on the right and choose Share.",
      "Click Create share link. Copy the link that appears.",
      "Anyone with the link can view it. No login required on their end.",
      "Regenerate the link to invalidate the old one, or turn sharing off entirely.",
    ],
  },
  {
    icon: Upload,
    title: "Import an existing CV",
    steps: [
      "From the dashboard, click the Dropzone at the top.",
      "Drag in a PDF or Word document up to 10 MB.",
      "We extract the text and parse it into structured fields.",
      "Review the extracted data in the editor and fix anything that looks wrong.",
      "Everything is editable. Nothing is saved until you click Save.",
    ],
  },
  {
    icon: Sparkles,
    title: "Tailor a CV to a job",
    steps: [
      "From the dashboard, click Tailor to a Job in the sidebar.",
      "Pick a CV to tailor.",
      "Paste the job description. At least 100 characters.",
      "Click Tailor. AI rewrites your summary and reorders skills to match the role.",
      "Review the match report. Accept the changes or edit them.",
      "We never invent skills or experience. Everything comes from your original CV.",
    ],
  },
  {
    icon: Search,
    title: "Find a document",
    steps: [
      "On the dashboard, use the search box below the New Document button.",
      "On the Write page, use the search box in the left rail.",
      "Type part of the title. The list filters as you type.",
      "Click the small X to clear the search.",
    ],
  },
  {
    icon: FileOutput,
    title: "Convert a PDF to Word",
    steps: [
      "From the dashboard, click PDF to Word in the sidebar.",
      "Drag in a PDF. Text-based PDFs work best.",
      "We extract the text and rebuild it as an editable Word document.",
      "Click Download Word. The file goes to your Downloads folder.",
      "Nothing is uploaded. Conversion runs entirely in your browser.",
    ],
  },
  {
    icon: Smartphone,
    title: "Install as an app",
    steps: [
      "On iPhone: open myDoc in Safari, tap Share, then Add to Home Screen.",
      "On Android: open in Chrome, use the menu, then Install app.",
      "On desktop: click the install icon in Chrome's address bar.",
      "Once installed, myDoc opens in its own window like a native app.",
      "Enable push notifications in Settings to get updates.",
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tightish text-ink"
          >
            my<span className="text-rust">Doc</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-stone-600 hover:text-rust"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Help
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
          How to use myDoc
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          A short guide to every feature. Come back here anytime.
        </p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="border border-stone-200 bg-white p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-rust/20 bg-rust/5">
                    <Icon className="h-4 w-4 text-rust" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                      Step {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold tracking-tightish text-ink">
                      {section.title}
                    </h2>
                    <ol className="mt-4 space-y-2">
                      {section.steps.map((step, j) => (
                        <li
                          key={j}
                          className="flex gap-3 text-sm leading-6 text-stone-700"
                        >
                          <span className="shrink-0 font-mono text-xs font-bold text-rust">
                            {j + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8">
          <p className="text-sm leading-6 text-stone-600">
            Still stuck? Reach out through our{" "}
            <a
              href="https://www.linkedin.com/company/mydoc-official"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-rust hover:underline"
            >
              LinkedIn page
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}