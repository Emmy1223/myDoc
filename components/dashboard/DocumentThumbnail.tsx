"use client";

import { useEffect, useRef, useState } from "react";
import CvPage from "@/components/builder/CvPage";
import type { CVData, TemplateId } from "@/lib/cv-data";
import { emptyCV, DEFAULT_SECTION_ORDER } from "@/lib/cv-data";

const THUMB_WIDTH = 52;
const THUMB_HEIGHT = 68;
const PAGE_WIDTH_PX = 793.7;
const PAGE_HEIGHT_PX = 1122.5;

export default function DocumentThumbnail({
  documentId,
  templateId,
  onClick,
  size = "small",
}: {
  documentId: string;
  templateId: string;
  onClick?: () => void;
  size?: "small" | "large";
}) {
  const [cv, setCv] = useState<CVData | null>(null);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/documents/${encodeURIComponent(documentId)}`,
        );
        if (!res.ok) {
          console.error("Thumbnail fetch failed:", res.status);
          if (!cancelled) setFailed(true);
          return;
        }
        const result = (await res.json()) as {
          document?: { content?: Record<string, unknown> | null };
        };
        if (cancelled) return;
        const content = result.document?.content;
        if (content && Object.keys(content).length > 0) {
          setCv({
            ...emptyCV,
            ...(content as Partial<CVData>),
            sectionOrder:
              (content as any).sectionOrder || DEFAULT_SECTION_ORDER,
          });
        } else {
          setCv(emptyCV);
        }
      } catch (err) {
        console.error("Thumbnail error:", err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const template: TemplateId =
    templateId === "ledger" || templateId === "slab" ? templateId : "folio";

  const width = size === "large" ? 595 : THUMB_WIDTH;
  const height = size === "large" ? 842 : THUMB_HEIGHT;
  const scale = width / PAGE_WIDTH_PX;

  const inner = (
    <div
      className="relative shrink-0 overflow-hidden border border-stone-300 bg-white"
      style={{ width, height }}
      aria-hidden={onClick ? undefined : true}
    >
      {cv ? (
        <div
          style={{
            width: PAGE_WIDTH_PX,
            height: PAGE_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
        >
          <CvPage
            cv={cv}
            template={template}
            density="compact"
            pageSize="A4"
            bulletStyle="dot"
            bulletSpacing="compact"
          />
        </div>
      ) : failed ? (
        <div className="flex h-full w-full items-center justify-center bg-stone-50 text-[10px] text-stone-400">
          No preview
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-50">
          <div className="h-4 w-4 animate-pulse rounded-full bg-stone-200" />
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 cursor-zoom-in transition-opacity hover:opacity-80"
        aria-label="Preview document"
      >
        {inner}
      </button>
    );
  }

  return inner;
}