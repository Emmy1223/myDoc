"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
  Download,
} from "lucide-react";
import { convertPdfToDocx, downloadBlob } from "@/lib/pdf-to-docx";

type State = "idle" | "converting" | "done" | "error";

export default function PdfToWordClient() {
  const [state, setState] = useState<State>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.name.match(/\.pdf$/i) && file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setState("error");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("File is too large. Maximum size is 25 MB.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("converting");
    setStatus("Preparing…");
    setError(null);
    setResultBlob(null);

    try {
      const blob = await convertPdfToDocx(file, setStatus);
      const baseName = file.name.replace(/\.pdf$/i, "");
      setResultBlob(blob);
      setResultName(`${baseName}.docx`);
      setState("done");
    } catch (err) {
      console.error("Conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not convert this PDF. It may be password-protected or corrupted.",
      );
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setFileName(null);
    setStatus("");
    setError(null);
    setResultBlob(null);
    setResultName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, resultName);
  }

  // Error state
  if (state === "error") {
    return (
      <div className="border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">Conversion failed</p>
            <p className="mt-0.5 text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={reset}
            className="border border-red-300 p-1 text-red-500 hover:border-red-500 hover:text-red-700"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  // Converting state
  if (state === "converting") {
    return (
      <div className="border border-rust/30 bg-orange-50 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rust" strokeWidth={2} />
          <div>
            <p className="font-display text-lg font-bold tracking-tightish text-ink">
              Converting to Word…
            </p>
            <p className="mt-1 text-sm text-stone-600">{status}</p>
          </div>
          <p className="max-w-sm text-xs leading-5 text-stone-500">
            We are extracting the text and structuring it for Word. This usually
            takes a few seconds.
          </p>
        </div>
      </div>
    );
  }

  // Done state
  if (state === "done" && resultBlob) {
    return (
      <div className="border border-stone-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rust" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold tracking-tightish text-ink">
              Conversion complete
            </p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {fileName} → {resultName}
            </p>
          </div>
          <button
            onClick={reset}
            className="border border-stone-300 p-1 text-stone-500 hover:border-ink hover:text-ink"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-rust px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rust-dark"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Download Word document
        </button>

        <p className="mt-3 text-center text-xs text-stone-500">
          The file downloads automatically. No print dialog, no picking a folder.
        </p>
      </div>
    );
  }

  // Idle state
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className="block cursor-pointer border border-dashed border-stone-300 bg-white p-10 text-center transition-colors hover:border-rust"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      <UploadCloud className="mx-auto h-8 w-8 text-rust" strokeWidth={1.5} />
      <p className="mt-3 font-display text-base font-bold tracking-tightish text-ink">
        Drop your PDF here
      </p>
      <p className="mt-1 text-xs leading-5 text-stone-500">
        Up to 25 MB{" "}
        <span className="mx-1 text-stone-300">·</span> or{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-rust">
          <FileText className="h-3 w-3" strokeWidth={2} />
          browse files
        </span>
      </p>
    </label>
  );
}