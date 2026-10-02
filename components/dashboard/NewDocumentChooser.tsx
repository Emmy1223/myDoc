"use client";

import { useEffect } from "react";
import { FileText, FileEdit, X } from "lucide-react";

export default function NewDocumentChooser({
  open,
  onClose,
  onPickCv,
  onPickDocument,
}: {
  open: boolean;
  onClose: () => void;
  onPickCv: () => void;
  onPickDocument: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <p className="font-display text-base font-bold tracking-tightish text-ink">
            What would you like to create?
          </p>
          <button
            type="button"
            onClick={onClose}
            className="border border-transparent p-2 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Cards */}
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={onPickCv}
            className="group flex flex-col items-start gap-3 border border-stone-200 bg-white p-6 text-left transition-colors hover:border-rust hover:bg-orange-50/40"
          >
            <span className="flex h-11 w-11 items-center justify-center border border-rust/20 bg-rust/5">
              <FileText className="h-5 w-5 text-rust" strokeWidth={1.75} />
            </span>
            <span className="font-display text-lg font-bold tracking-tightish text-ink">
              CV / Resume
            </span>
            <span className="text-sm leading-6 text-stone-600">
              Build a polished CV with AI guidance. Answer a few questions and
              get a first draft you can edit.
            </span>
          </button>

          <button
            type="button"
            onClick={onPickDocument}
            className="group flex flex-col items-start gap-3 border border-stone-200 bg-white p-6 text-left transition-colors hover:border-rust hover:bg-orange-50/40"
          >
            <span className="flex h-11 w-11 items-center justify-center border border-stone-200 bg-stone-50">
              <FileEdit className="h-5 w-5 text-stone-600" strokeWidth={1.75} />
            </span>
            <span className="font-display text-lg font-bold tracking-tightish text-ink">
              Document
            </span>
            <span className="text-sm leading-6 text-stone-600">
              Write a project brief, report, meeting notes, or anything else.
              Start from blank or a template.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}