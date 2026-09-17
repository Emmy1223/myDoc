"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardList,
  Sparkles,
  Eye,
  Download,
  type LucideIcon,
} from "lucide-react";

type Page = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const PAGES: Page[] = [
  {
    icon: FileText,
    title: "Your Source CV",
    body: "Upload a resume or create a new one. The experience you enter here is permanent, it is your source of truth.",
  },
  {
    icon: ClipboardList,
    title: "The Job Description",
    body: "Paste the job description you are applying for. We will analyze it to understand what the role actually wants.",
  },
  {
    icon: Sparkles,
    title: "Tailoring",
    body: "Your profile and summary are rewritten to match the job. Your skills are reordered and updated to emphasize what is relevant. Nothing is invented.",
  },
  {
    icon: Eye,
    title: "Review",
    body: "Preview your tailored resume and correct anything manually. You have full control over every change.",
  },
  {
    icon: Download,
    title: "Export",
    body: "Download your tailored resume as a PDF, ready to submit.",
  },
];

export default function HowItWorksModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);

  if (!open) return null;

  const current = PAGES[page];
  const Icon = current.icon;
  const isFirst = page === 0;
  const isLast = page === PAGES.length - 1;

  function handleClose() {
    setPage(0);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 border border-transparent p-1.5 text-stone-400 hover:border-stone-300 hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Content */}
        <div className="px-8 pb-6 pt-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-rust/20 bg-rust/5">
            <Icon className="h-6 w-6 text-rust" strokeWidth={1.75} />
          </div>

          <h2 className="mt-5 font-display text-2xl font-bold tracking-tightish text-ink">
            {current.title}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
            {current.body}
          </p>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {PAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`h-1.5 transition-all ${
                i === page ? "w-6 bg-rust" : "w-1.5 bg-stone-300 hover:bg-stone-400"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
          <div>
            {!isFirst && (
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                className="inline-flex min-h-10 items-center gap-1.5 border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-600 hover:border-stone-900 hover:text-ink transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="min-h-10 px-3 text-sm font-semibold text-stone-500 hover:text-ink transition-colors"
            >
              Skip
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex min-h-10 items-center gap-1.5 bg-rust px-4 text-sm font-semibold text-white hover:bg-rust-dark transition-colors"
              >
                Got it
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                className="inline-flex min-h-10 items-center gap-1.5 bg-rust px-4 text-sm font-semibold text-white hover:bg-rust-dark transition-colors"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}