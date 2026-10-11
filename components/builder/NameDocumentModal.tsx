"use client";

import { useEffect, useRef, useState } from "react";
import { FileDown, X } from "lucide-react";

export default function NameDocumentModal({
  open,
  defaultName,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  defaultName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}) {
  const [value, setValue] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue(defaultName);
    // Focus + select after mount
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => window.clearTimeout(t);
  }, [open, defaultName]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && value.trim().length > 0) {
        e.preventDefault();
        onConfirm(value.trim());
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel, onConfirm, value]);

  if (!open) return null;

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stone-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-rust/20 bg-rust/5">
              <FileDown className="h-4 w-4 text-rust" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-base font-bold tracking-tightish text-ink">
                Name your CV before downloading
              </p>
              <p className="mt-0.5 text-xs leading-5 text-stone-500">
                Give it a name so it is easy to find later in your dashboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="border border-transparent p-1.5 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-5">
          <label
            htmlFor="doc-name-input"
            className="text-xs font-semibold uppercase tracking-wider text-stone-500"
          >
            Document name
          </label>
          <input
            id="doc-name-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Emmanuel Faleti, Frontend Engineer"
            className="mt-2 w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-rust"
          />
          <p className="mt-2 text-xs leading-5 text-stone-500">
            This will also be the filename of your PDF.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-500 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => canSubmit && onConfirm(trimmed)}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 bg-rust px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" strokeWidth={2} />
            Save & Download
          </button>
        </div>
      </div>
    </div>
  );
}