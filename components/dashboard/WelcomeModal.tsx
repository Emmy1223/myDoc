"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  FileText,
  PenLine,
  Share2,
  Smartphone,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SLIDES = [
  {
    icon: Sparkles,
    title: "Welcome to myDoc",
    body: "A CV builder and document workspace that does not lie. Build a CV, write a brief, share a link. All in one place.",
  },
  {
    icon: FileText,
    title: "Build a CV",
    body: "Upload an existing PDF or Word CV and AI maps it into structured fields. Or start from scratch and pick a template.",
  },
  {
    icon: PenLine,
    title: "Write anything else",
    body: "Project briefs, reports, meeting notes, invoices. A full rich-text editor with reusable templates.",
  },
  {
    icon: Share2,
    title: "Share with a link",
    body: "Turn any CV or document into a public URL. Send it to a recruiter or client. No login needed on their end.",
  },
  {
    icon: Smartphone,
    title: "Install as an app",
    body: "Add myDoc to your home screen on iOS, Android, or desktop. Get notified when we ship something new.",
  },
];

export default function WelcomeModal({
  open,
  onComplete,
}: {
  open: boolean;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onComplete();
      if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onComplete]);

  if (!open) return null;

  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white">
        {/* Close */}
        <div className="flex justify-end px-3 pt-3">
          <button
            type="button"
            onClick={onComplete}
            className="border border-transparent p-1.5 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Slide content */}
        <div className="px-6 pb-6 pt-1">
          <span className="flex h-14 w-14 items-center justify-center border border-rust/20 bg-rust/5">
            <Icon className="h-6 w-6 text-rust" strokeWidth={1.75} />
          </span>

          <h2 className="mt-6 font-display text-2xl font-extrabold leading-tight tracking-tightish text-ink">
            {slide.title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-stone-600">
            {slide.body}
          </p>

          {/* Progress dots */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-rust"
                    : "w-1.5 bg-stone-300 hover:bg-stone-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-6 py-4">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={isFirst}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onComplete}
              className="text-xs font-semibold text-stone-500 transition-colors hover:text-ink"
            >
              Skip
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-2 bg-rust px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rust-dark"
              >
                Get started
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1))}
                className="inline-flex items-center gap-1.5 bg-ink px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}