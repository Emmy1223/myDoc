"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Cloud, CloudOff, FileDown, Save } from "lucide-react";
import Link from "next/link";
import DocEditor from "./DocEditor";
import DocToolbar from "./DocToolbar";
import DocListRail, { type DocListItem } from "./DocListRail";
import {
  emptyDocContent,
  isRichDocContent,
  type RichDocNode,
} from "@/lib/doc-data";

type FullDoc = {
  id: string;
  title: string;
  kind: string;
  status: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
};

export default function DocBuilderClient({
  initialDocuments,
  initialActiveId,
}: {
  initialDocuments: DocListItem[];
  initialActiveId?: string | null;
}) {
  const fallbackId = initialDocuments[0]?.id ?? null;
  const startId = initialActiveId ?? fallbackId;

  const [documents, setDocuments] = useState<DocListItem[]>(initialDocuments);
  const [activeId, setActiveId] = useState<string | null>(startId);
  const [title, setTitle] = useState<string>(
    initialDocuments.find((d) => d.id === startId)?.title ?? "Untitled document",
  );
  const [body, setBody] = useState<RichDocNode>(emptyDocContent().doc);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<number | null>(null);

  /* ---------------- Load active document ---------------- */
  useEffect(() => {
    if (!activeId) {
      setBody(emptyDocContent().doc);
      setTitle("Untitled document");
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/documents/${activeId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        const doc = data.document as (FullDoc & { content?: unknown }) | undefined;

        if (!doc) {
          // Document missing (deleted, wrong user, stale URL). Fall back.
          setTitle("Untitled document");
          setBody(emptyDocContent().doc);
          setSaved(true);
          return;
        }

        setTitle(doc.title);
        if (isRichDocContent(doc.content)) {
          setBody(doc.content.doc);
        } else {
          setBody(emptyDocContent().doc);
        }
        setSaved(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  /* ---------------- Debounced autosave ---------------- */
  const scheduleSave = useCallback(
    (nextTitle: string, nextBody: RichDocNode) => {
      if (!activeId) return;
      setSaved(false);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        try {
          await fetch(`/api/documents/${activeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: nextTitle,
              content: { schemaVersion: 1, doc: nextBody },
            }),
          });
          setSaved(true);
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === activeId
                ? {
                    ...d,
                    title: nextTitle,
                    updatedAt: new Date().toISOString(),
                  }
                : d,
            ),
          );
        } catch {
          setSaved(false);
        }
      }, 800);
    },
    [activeId],
  );

  /* ---------------- Manual save (flush immediately) ---------------- */
  const saveNow = useCallback(async () => {
    if (!activeId) return;
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setSaved(false);
    try {
      await fetch(`/api/documents/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: { schemaVersion: 1, doc: body },
        }),
      });
      setSaved(true);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeId
            ? { ...d, title, updatedAt: new Date().toISOString() }
            : d,
        ),
      );
    } catch {
      setSaved(false);
    }
  }, [activeId, title, body]);

  const handleBodyChange = useCallback(
    (next: RichDocNode) => {
      setBody(next);
      if (loading) return;
      scheduleSave(title, next);
    },
    [scheduleSave, title, loading],
  );

  const handleTitleChange = useCallback(
    (next: string) => {
      setTitle(next);
      scheduleSave(next, body);
    },
    [scheduleSave, body],
  );

  /* ---------------- Create new document ---------------- */
  const handleCreate = useCallback(
    async (templateId: string, initialBody: RichDocNode, name: string) => {
      const res = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name,
          kind: "Document",
          templateId,
          content: { schemaVersion: 1, doc: initialBody },
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const created = data.document as FullDoc;
      const item: DocListItem = {
        id: created.id,
        title: created.title,
        updatedAt: created.updatedAt,
      };
      setDocuments((prev) => [item, ...prev]);
      setActiveId(created.id);
      setTitle(created.title);
      setBody(initialBody);
      setSaved(true);
    },
    [],
  );

  const handleDownload = () => window.print();

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden md:h-screen md:flex-row">
      {/* Left rail — on mobile it renders just the hamburger button;
          on desktop it renders the full sidebar */}
      <DocListRail
        documents={documents}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={handleCreate}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex flex-col gap-2 border-b border-stone-200 bg-white px-3 py-2 print-hidden md:flex-row md:items-center md:justify-between md:gap-0 md:px-5 md:py-3">
          {/* Row 1: back link + title */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-stone-300 bg-white text-stone-600 transition-colors hover:border-rust hover:text-rust print-hidden"
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </Link>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="min-w-0 flex-1 bg-transparent font-display text-base font-bold tracking-tightish text-ink outline-none placeholder:text-stone-400 md:text-lg"
              placeholder="Untitled document"
              aria-label="Document title"
            />
          </div>

          {/* Row 2 (mobile) / same row (desktop): status + actions */}
          <div className="flex items-center justify-between gap-2 md:ml-4 md:justify-end md:gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                saved ? "text-stone-500" : "text-rust"
              }`}
            >
              {saved ? (
                <>
                  <Cloud className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="hidden sm:inline">Saved</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="hidden sm:inline">Unsaved</span>
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={saveNow}
                disabled={saved || !activeId}
                className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rust hover:text-rust disabled:cursor-not-allowed disabled:opacity-50 md:gap-2 md:px-4 md:py-2 md:text-sm"
              >
                <Save className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 bg-rust px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rust-dark md:gap-2 md:px-4 md:py-2 md:text-sm"
              >
                <FileDown
                  className="h-3.5 w-3.5 md:h-4 md:w-4"
                  strokeWidth={2}
                />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <DocToolbar disabled={loading || !activeId} />

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-stone-200">
          <div className="doc-print-area mx-auto my-3 w-full max-w-[210mm] bg-white shadow-sm md:my-8 md:min-h-[297mm] md:w-[210mm]">
            <DocEditor
              key={activeId ?? "new"}
              body={body}
              onChange={handleBodyChange}
              editable={!!activeId && !loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}