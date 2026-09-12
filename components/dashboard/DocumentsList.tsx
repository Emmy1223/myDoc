"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  FilePlus2,
  LoaderCircle,
  Plus,
  Upload,
  X,
} from "lucide-react";
import DocumentThumbnail from "./DocumentThumbnail";
import DocumentRowMenu, { type RowAction } from "./DocumentRowMenu";
import DocumentPreviewModal from "./DocumentPreviewModal";

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

type Notice = { tone: "error" | "success"; message: string } | null;

export default function DocumentsList({
  userName,
  documents: initialDocuments,
  stats,
}: {
  userName: string;
  documents: DocumentItem[];
  stats: {
    totalDocuments: number;
    exportsThisMonth: number;
    mostUsedTemplate: string | null;
  };
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [workingAction, setWorkingAction] = useState<RowAction | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const handleUploadClick = () => {
    uploadInput.current?.click();
  };

  const handleUploadFile = async (file: File) => {
    setWorkingId("upload");
    try {
      const title = file.name.replace(/\.[^/.]+$/, "").trim() || "Uploaded CV";
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title,
          kind: "CV",
          status: "in-progress",
        }),
      });
      const result = (await res.json()) as {
        document?: DocumentItem;
        error?: string;
      };
      if (!res.ok || !result.document) {
        throw new Error(result.error ?? "Could not start the upload.");
      }
      router.push(
        `/builder?upload=1&document=${encodeURIComponent(result.document.id)}`,
      );
    } catch (err) {
      setNotice({
        tone: "error",
        message:
          err instanceof Error ? err.message : "Could not start the upload.",
      });
    } finally {
      setWorkingId(null);
      if (uploadInput.current) uploadInput.current.value = "";
    }
  };

  const handleCreateBlank = async () => {
    setWorkingId("create");
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: "Untitled document",
          kind: "CV",
          status: "draft",
        }),
      });
      const result = (await res.json()) as {
        document?: DocumentItem;
        error?: string;
      };
      if (!res.ok || !result.document) {
        throw new Error(result.error ?? "Could not create the document.");
      }
      router.push(
        `/builder?document=${encodeURIComponent(result.document.id)}`,
      );
    } catch (err) {
      setNotice({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not create the document.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  const handleRenameStart = (doc: DocumentItem) => {
    setOpenMenuId(null);
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  };

  const handleRenameSubmit = async (id: string) => {
    const trimmed = renameValue.trim();
    const doc = documents.find((d) => d.id === id);
    if (!doc) {
      setRenamingId(null);
      return;
    }
    if (!trimmed || trimmed === doc.title) {
      setRenamingId(null);
      return;
    }
    setWorkingId(id);
    setWorkingAction("rename");
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Could not rename the document.");
      }
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, title: trimmed } : d)),
      );
      setNotice({ tone: "success", message: "Renamed." });
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof Error ? err.message : "Could not rename.",
      });
    } finally {
      setRenamingId(null);
      setWorkingId(null);
      setWorkingAction(null);
    }
  };

  const handleRowAction = async (doc: DocumentItem, action: RowAction) => {
    if (action === "edit") {
      setOpenMenuId(null);
      router.push(`/builder?document=${encodeURIComponent(doc.id)}`);
      return;
    }

    if (action === "rename") {
      handleRenameStart(doc);
      return;
    }

    if (action === "download") {
      setOpenMenuId(null);
      window.open(
        `/builder?document=${encodeURIComponent(doc.id)}&print=1`,
        "_blank",
      );
      return;
    }

    if (action === "open") {
      setOpenMenuId(null);
      window.open(`/builder?document=${encodeURIComponent(doc.id)}`, "_blank");
      return;
    }

    if (action === "export-json") {
      setOpenMenuId(null);
      setWorkingId(doc.id);
      setWorkingAction("export-json");
      try {
        const res = await fetch(
          `/api/documents/${encodeURIComponent(doc.id)}`,
        );
        if (!res.ok) throw new Error("Could not fetch the document.");
        const result = (await res.json()) as {
          document?: { content?: Record<string, unknown> | null };
        };
        const content = result.document?.content ?? {};
        const filename = `${doc.title.replace(/[^a-z0-9-_]+/gi, "_")}.json`;
        const blob = new Blob([JSON.stringify(content, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setNotice({ tone: "success", message: "Exported as JSON." });
      } catch (err) {
        setNotice({
          tone: "error",
          message:
            err instanceof Error ? err.message : "Could not export the CV.",
        });
      } finally {
        setWorkingId(null);
        setWorkingAction(null);
      }
      return;
    }

    if (action === "duplicate") {
      setOpenMenuId(null);
      setWorkingId(doc.id);
      setWorkingAction("duplicate");
      try {
        const res = await fetch(
          `/api/documents/${encodeURIComponent(doc.id)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "duplicate" }),
          },
        );
        const result = (await res.json()) as {
          document?: DocumentItem;
          error?: string;
        };
        if (!res.ok || !result.document) {
          throw new Error(result.error ?? "Could not duplicate.");
        }
        setDocuments((prev) => [result.document!, ...prev]);
        setNotice({ tone: "success", message: "Duplicated." });
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : "Could not duplicate.",
        });
      } finally {
        setWorkingId(null);
        setWorkingAction(null);
      }
      return;
    }

    if (action === "delete") {
      if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
        setOpenMenuId(null);
        return;
      }
      setOpenMenuId(null);
      setWorkingId(doc.id);
      setWorkingAction("delete");
      try {
        const res = await fetch(
          `/api/documents/${encodeURIComponent(doc.id)}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(err.error ?? "Could not delete.");
        }
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        setNotice({ tone: "success", message: "Deleted." });
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : "Could not delete.",
        });
      } finally {
        setWorkingId(null);
        setWorkingAction(null);
      }
      return;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <input
        ref={uploadInput}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUploadFile(file);
        }}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
            Recent Documents
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {documents.length === 0
              ? "No documents yet. Create your first one to get started."
              : `${documents.length} document${documents.length !== 1 ? "s" : ""} in your library. Pick one up where you left off.`}
          </p>
        </div>
        <button
          onClick={handleCreateBlank}
          disabled={workingId !== null}
          className="inline-flex items-center gap-2 bg-rust px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-dark disabled:cursor-wait disabled:opacity-70 print-hidden"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Create New Document
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`mt-6 flex items-start justify-between gap-3 border px-4 py-3 text-sm leading-6 ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-rust/20 bg-orange-50 text-ink"
          }`}
        >
          <span>{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <EmptyState
          userName={userName}
          onUpload={handleUploadClick}
          onCreate={handleCreateBlank}
          working={workingId !== null}
        />
      ) : (
        <ul className="mt-2">
          {documents.map((doc) => {
            const isWorking = workingId === doc.id;
            const isRenaming = renamingId === doc.id;
            const menuOpen = openMenuId === doc.id;

            return (
              <li
                key={doc.id}
                className={`group flex flex-wrap items-center gap-4 border-b border-stone-200 py-4 transition-opacity ${
                  isWorking ? "opacity-70" : ""
                }`}
              >
                <DocumentThumbnail
                  documentId={doc.id}
                  templateId={doc.templateId}
                  onClick={() => setPreviewDoc(doc)}
                />

                <div className="min-w-0 flex-1">
                  {isRenaming ? (
                    <input
                      value={renameValue}
                      autoFocus
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleRenameSubmit(doc.id);
                        }
                        if (e.key === "Escape") {
                          setRenamingId(null);
                        }
                      }}
                      onBlur={() => void handleRenameSubmit(doc.id)}
                      className="min-w-0 flex-1 border border-rust bg-white px-2 py-1 font-display text-base font-bold tracking-tightish text-ink outline-none"
                    />
                  ) : (
                    <p className="truncate font-display text-base font-bold tracking-tightish text-ink">
                      {doc.title}
                    </p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="h-3 w-3" strokeWidth={2} />
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    <span className="text-stone-300">/</span>
                    <span>{doc.templateName} template</span>
                  </p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-label={`Actions for ${doc.title}`}
                    aria-expanded={menuOpen}
                    onClick={() => setOpenMenuId(menuOpen ? null : doc.id)}
                    className="inline-flex items-center justify-center border border-transparent p-2 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                  <DocumentRowMenu
                    open={menuOpen}
                    workingAction={isWorking ? workingAction : null}
                    onAction={(action) => void handleRowAction(doc, action)}
                    onClose={() => setOpenMenuId(null)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {documents.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-stone-200 pt-8 sm:grid-cols-3">
          <StatBlock label="Total" value={String(documents.length)} />
          <StatBlock
            label="Exports this month"
            value={String(stats.exportsThisMonth)}
          />
          <StatBlock
            label="Most used template"
            value={stats.mostUsedTemplate ?? "None"}
          />
        </div>
      )}

      <DocumentPreviewModal
        open={previewDoc !== null}
        documentId={previewDoc?.id ?? null}
        title={previewDoc?.title ?? ""}
        templateId={previewDoc?.templateId ?? "folio"}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function EmptyState({
  userName,
  onUpload,
  onCreate,
  working,
}: {
  userName: string;
  onUpload: () => void;
  onCreate: () => void;
  working: boolean;
}) {
  const firstName = userName.split(" ")[0] || "there";
  return (
    <div className="mt-10 border border-stone-200 bg-white p-8 md:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
        Welcome
      </p>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tightish text-ink md:text-4xl">
        Hello, {firstName}.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        You do not have any CVs yet. Upload an existing one and we will
        populate the fields for you, or start from a blank page and fill it in
        manually.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onUpload}
          disabled={working}
          className="group flex flex-col items-start gap-3 border border-stone-200 bg-white p-5 text-left transition-colors hover:border-rust disabled:cursor-wait disabled:opacity-70"
        >
          <span className="flex h-10 w-10 items-center justify-center border border-rust/20 bg-rust/5">
            {working ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin text-rust"
                strokeWidth={2}
              />
            ) : (
              <Upload className="h-4 w-4 text-rust" strokeWidth={2} />
            )}
          </span>
          <span className="flex w-full items-center justify-between gap-3">
            <span className="font-display text-base font-bold tracking-tightish text-ink">
              Upload existing CV
            </span>
            <ArrowRight
              className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rust"
              strokeWidth={2}
            />
          </span>
          <span className="text-xs leading-5 text-stone-500">
            Bring in a PDF or Word document. We will extract and map the
            content automatically.
          </span>
        </button>

        <button
          type="button"
          onClick={onCreate}
          disabled={working}
          className="group flex flex-col items-start gap-3 border border-stone-200 bg-white p-5 text-left transition-colors hover:border-rust disabled:cursor-wait disabled:opacity-70"
        >
          <span className="flex h-10 w-10 items-center justify-center border border-stone-200 bg-stone-50">
            <FilePlus2 className="h-4 w-4 text-stone-600" strokeWidth={2} />
          </span>
          <span className="flex w-full items-center justify-between gap-3">
            <span className="font-display text-base font-bold tracking-tightish text-ink">
              Start from blank
            </span>
            <ArrowRight
              className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rust"
              strokeWidth={2}
            />
          </span>
          <span className="text-xs leading-5 text-stone-500">
            Begin with an empty document and add each section manually.
          </span>
        </button>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-6">
        <p className="text-xs leading-5 text-stone-500">
          Have a job description? Use{" "}
          <Link
            href="/dashboard/tailor"
            className="font-semibold text-rust hover:underline"
          >
            Tailor to a Job
          </Link>{" "}
          to rewrite your summary and skills for a specific role.
        </p>
      </div>
    </div>
  );
}