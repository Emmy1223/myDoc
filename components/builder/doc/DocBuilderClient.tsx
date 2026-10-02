"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cloud, CloudOff, FileDown, Save } from "lucide-react";
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
        const doc = data.document as FullDoc & { content?: unknown };

        console.log("[load] raw doc from API:", {
          id: doc.id,
          title: doc.title,
          hasContent: !!doc.content,
          contentType: doc.content ? typeof doc.content : "null",
          contentKeys: doc.content
            ? Object.keys(doc.content as any)
            : null,
          isRich: isRichDocContent(doc.content),
        });

        setTitle(doc.title);
        if (isRichDocContent(doc.content)) {
          console.log(
            "[load] setting body from rich content. docLen =",
            JSON.stringify(doc.content.doc).length,
          );
          setBody(doc.content.doc);
        } else {
          console.log(
            "[load] NOT rich — falling back to empty doc. raw =",
            doc.content,
          );
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left rail */}
      <DocListRail
        documents={documents}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={handleCreate}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3 print-hidden">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent font-display text-lg font-bold tracking-tightish text-ink outline-none placeholder:text-stone-400"
            placeholder="Untitled document"
            aria-label="Document title"
          />
          <div className="ml-4 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                saved ? "text-stone-500" : "text-rust"
              }`}
            >
              {saved ? (
                <>
                  <Cloud className="h-3.5 w-3.5" strokeWidth={2} /> Saved
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5" strokeWidth={2} /> Unsaved
                </>
              )}
            </span>
            <button
              onClick={saveNow}
              disabled={saved || !activeId}
              className="inline-flex items-center gap-2 border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-rust hover:text-rust disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              Save
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-rust px-4 py-2 text-sm font-semibold text-white hover:bg-rust-dark"
            >
              <FileDown className="h-4 w-4" strokeWidth={2} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <DocToolbar disabled={loading || !activeId} />

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-stone-200">
          <div className="doc-print-area mx-auto my-8 w-[210mm] min-h-[297mm] bg-white shadow-sm">
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