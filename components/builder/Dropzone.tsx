"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from "lucide-react";

export type UploadState = "idle" | "extracting" | "done";

export default function Dropzone({
  onExtracted,
  highlight,
  onHighlightClear,
}: {
  onExtracted: (fileName: string) => void;
  highlight: boolean;
  onHighlightClear: () => void;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setState("extracting");
    onHighlightClear();
    // Simulate PDF/DOCX text extraction + LLM mapping into the CV schema.
    window.setTimeout(() => {
      setState("done");
      onExtracted(file.name);
    }, 1800);
  }

  function reset() {
    setState("idle");
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (state === "extracting") {
    return (
      <div className="border border-rust bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-rust" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-ink">
              Extracting your CV…
            </p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              Reading {fileName} and mapping text into fields
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="border border-stone-900 bg-white p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-rust" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">CV imported</p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {fileName} — six sections mapped to the template
            </p>
          </div>
          <button
            onClick={reset}
            className="border border-stone-300 p-1 text-stone-500 hover:border-ink hover:text-ink"
            aria-label="Clear uploaded file"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`block cursor-pointer border border-dashed p-5 text-center transition-colors ${
        dragging
          ? "border-rust bg-orange-50"
          : highlight
            ? "border-rust bg-orange-50"
            : "border-stone-300 bg-white hover:border-stone-900"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      <UploadCloud
        className={`mx-auto h-6 w-6 ${dragging || highlight ? "text-rust" : "text-stone-400"}`}
        strokeWidth={1.5}
      />
      <p className="mt-2 text-sm font-semibold text-ink">
        Drag your old CV here to auto-fill
      </p>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        PDF or DOCX, up to 10 MB{" "}
        <span className="mx-1 text-stone-300">·</span> or{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-rust">
          <FileText className="h-3 w-3" strokeWidth={2} />
          browse files
        </span>
      </p>
    </label>
  );
}
