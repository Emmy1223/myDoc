"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  FileText,
  Plus,
  Clock,
  ArrowRight,
  Upload,
  LoaderCircle,
  X,
  Trash2,
} from "lucide-react";

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
  onDelete,
  onDeleteAll,
  uploading,
  uploadingFileName,
  deletingId,
  deletingAll,
}: {
  documents: DocumentItem[];
  onChoose: (id: string) => void;
  onFilePicked: (file: File) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  uploading: boolean;
  uploadingFileName: string | null;
  deletingId: string | null;
  deletingAll: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

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
          We will use this CV as the source of truth. Your original stays
          untouched — we create a new tailored version.
        </p>
      </div>

      {/* Uploading banner */}
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

      {/* Pinned actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {/* Upload CV */}
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

        {/* Create new */}
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

      {/* Existing documents */}
      {documents.length > 0 ? (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Or use an existing CV
            </p>
            <button
              type="button"
              onClick={() => setConfirmDeleteAll(true)}
              disabled={deletingAll || uploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Delete all
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {documents.map((doc) => {
              const isDeleting = deletingId === doc.id;
              return (
                <div
                  key={doc.id}
                  className={`group relative border bg-white transition-colors ${
                    isDeleting
                      ? "border-stone-200 opacity-60"
                      : "border-stone-200 hover:border-rust"
                  }`}
                >
                  {/* Delete X button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDeleting) onDelete(doc.id);
                    }}
                    disabled={isDeleting || deletingAll}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center border border-transparent text-stone-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50 transition-colors"
                    aria-label={`Delete ${doc.title}`}
                    title="Delete"
                  >
                    {isDeleting ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                    ) : (
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onChoose(doc.id)}
                    disabled={uploading || isDeleting || deletingAll}
                    className="flex w-full flex-col items-start gap-3 p-4 text-left disabled:cursor-not-allowed"
                  >
                    <div className="flex w-full items-start gap-3 pr-8">
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
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8 border border-dashed border-stone-300 bg-white px-6 py-8 text-center">
          <FileText className="mx-auto h-6 w-6 text-stone-400" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-stone-600">
            You don't have any saved CVs yet. Upload one or create a new one above.
          </p>
        </div>
      )}

      {/* Delete all confirmation modal */}
      {confirmDeleteAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deletingAll && setConfirmDeleteAll(false)}
        >
          <div
            className="w-full max-w-md bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center bg-red-100">
                <Trash2 className="h-4 w-4 text-red-600" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold tracking-tightish text-ink">
                  Delete all CVs?
                </h3>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  This will permanently delete all {documents.length} of your
                  saved CVs. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(false)}
                disabled={deletingAll}
                className="flex-1 border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 hover:border-ink hover:text-ink disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAll();
                  setConfirmDeleteAll(false);
                }}
                disabled={deletingAll}
                className="flex-1 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-70 transition-colors"
              >
                {deletingAll ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                    Deleting…
                  </span>
                ) : (
                  "Yes, delete all"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}