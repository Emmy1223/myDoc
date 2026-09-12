"use client";

import { useEffect, useRef, useState } from "react";
import CvPage from "@/components/builder/CvPage";
import type { CVData, TemplateId } from "@/lib/cv-data";
import { emptyCV, DEFAULT_SECTION_ORDER } from "@/lib/cv-data";

const THUMB_WIDTH = 52;
const THUMB_HEIGHT = 68;
const PAGE_WIDTH_PX = 793.7;
const PAGE_HEIGHT_PX = 1122.5;
const SCALE = THUMB_WIDTH / PAGE_WIDTH_PX;

export default function DocumentThumbnail({
  documentId,
  templateId,
}: {
  documentId: string;
  templateId: string;
}) {
  const [cv, setCv] = useState<CVData | null>(null);
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
        if (!res.ok) return;
        const result = (await res.json()) as {
          document?: { content?: Record<string, unknown> | null };
        };
        if (cancelled) return;
        const content = result.document?.content;
        if (content) {
          setCv({
            ...emptyCV,
            ...(content as Partial<CVData>),
            sectionOrder:
              (content as any).sectionOrder || DEFAULT_SECTION_ORDER,
          });
        } else {
          setCv(emptyCV);
        }
      } catch {
        if (!cancelled) setCv(emptyCV);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const template: TemplateId =
    templateId === "ledger" || templateId === "slab" ? templateId : "folio";

  return (
    <div
      className="relative shrink-0 overflow-hidden border border-stone-300 bg-white"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
      aria-hidden
    >
      {cv ? (
        <div
          style={{
            width: PAGE_WIDTH_PX,
            height: PAGE_HEIGHT_PX,
            transform: `scale(${SCALE})`,
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
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-50">
          <div className="h-5 w-5 animate-pulse rounded-full bg-stone-200" />
        </div>
      )}
    </div>
  );
}