"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import DocumentThumbnail from "./DocumentThumbnail";

export default function DocumentPreviewModal({
  open,
  documentId,
  title,
  templateId,
  onClose,
}: {
  open: boolean;
  documentId: string | null;
  title: string;
  templateId: string;
  onClose: () => void;
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

  if (!open || !documentId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <p className="truncate font-display text-base font-bold tracking-tightish text-ink">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="border border-transparent p-2 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-stone-100 p-6">
          <DocumentThumbnail
            documentId={documentId}
            templateId={templateId}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}