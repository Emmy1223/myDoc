"use client";

import Link from "next/link";
import { useRef } from "react";
import { FileText, Plus, Clock, ArrowRight, Upload, LoaderCircle } from "lucide-react";

type DocumentItem = {
  id: string;
  title: string;
  kind: string;
  status: "draft" | "in-progress" | "completed";
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  exportCount: number;
};

export default function ChooseCvStep({
  documents,
  onChoose,
  onFilePicked,
  uploading,
  uploadingFileName,
}: {
  documents: DocumentItem[];
  onChoose: (id: string) => void;
  onFilePicked: (file: File) => void;
  uploading: boolean;
  uploadingFileName: string | null;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const usable = documents;

  function openFilePicker() {
    if (uploading) return;
    fileInput.current?.click();
  }

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFilePicked(file);
          // reset so the same file can be picked again
          if (fileInput.current) fileInput.current.value = "";
        }}
      />

      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Step 1 of 3
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
          Choose a CV to tailor
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          We will use this CV as the source of truth. Your original stays untouched —
          we create a new tailored version.
        </p>
      </div>

      {/* Uploading state banner */}
      {uploading && (
        <div className="mt-6 flex items-center gap-3 border border-rust/20 bg-orange-50 px-4 py-3">
          <LoaderCircle className="h-4 w-4 animate-spin text-rust" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              Reading {uploadingFileName ?? "your CV"}…
            </p>
            <p className="mt-0.5 text-xs text-stone-600">
              Extracting text and mapping fields. This usually takes a few seconds.
            </p>
          </div>
        </div>
      )}

      {usable.length === 0 ? (
        <div className="mt-8 border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-stone-400" strokeWidth={1.5} />
          <h3 className="mt-4 font-display text-xl font-bold text-ink">
            No documents yet
          </h3>
          <p className="mt-2 text-sm text-stone-600">
            Upload an existing CV or create a new one, then come back to tailor it.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-rust px-6 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:cursor-wait disabled:opacity-70 transition-colors"
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              Upload a CV
            </button>
            <Link
              href="/builder?new=1"
              className="inline-flex items-center gap-2 border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-ink hover:border-rust hover:text-rust transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create a new CV
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {usable.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onChoose(doc.id)}
              disabled={uploading}
              className="group flex flex-col items-start gap-3 border border-stone-200 bg-white p-4 text-left hover:border-rust transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex w-full items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-stone-300 bg-white">
                  <FileText className="h-4 w-4 text-stone-500" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold tracking-tightish text-ink">
                    {doc.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {doc.templateName} template
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center justify-between border-t border-stone-100 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Use this CV
                </span>
                <ArrowRight
                  className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rust"
                  strokeWidth={2}
                />
              </div>
            </button>
          ))}

          {/* Upload new CV card */}
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="group flex flex-col items-start gap-3 border border-dashed border-stone-300 bg-white p-4 text-left hover:border-rust transition-colors disabled:cursor-wait disabled:opacity-70"
          >
            <div className="flex w-full items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-dashed border-stone-300 bg-white">
                {uploading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-rust" strokeWidth={2} />
                ) : (
                  <Upload className="h-4 w-4 text-stone-500" strokeWidth={2} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold tracking-tightish text-ink">
                  Upload a CV
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  Bring in an existing PDF or Word document.
                </p>
              </div>
            </div>
            <div className="flex w-full items-center justify-between border-t border-stone-100 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {uploading ? "Uploading…" : "Upload file"}
              </span>
              <ArrowRight
                className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rust"
                strokeWidth={2}
              />
            </div>
          </button>

          {/* Create new CV card */}
          <Link
            href="/builder?new=1"
            className="group flex flex-col items-start gap-3 border border-dashed border-stone-300 bg-white p-4 text-left hover:border-rust transition-colors"
          >
            <div className="flex w-full items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-dashed border-stone-300 bg-white">
                <Plus className="h-4 w-4 text-stone-500" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold tracking-tightish text-ink">
                  Create a new CV
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  Start from scratch and add your experience first.
                </p>
              </div>
            </div>
            <div className="flex w-full items-center justify-between border-t border-stone-100 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Start blank
              </span>
              <ArrowRight
                className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rust"
                strokeWidth={2}
              />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}