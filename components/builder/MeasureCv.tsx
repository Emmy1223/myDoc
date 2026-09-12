"use client";

import { useEffect, useRef } from "react";
import CvPage from "./CvPage";
import type { CVData, TemplateId, Density } from "@/lib/cv-data";

const PAGE_PX: Record<"A4" | "Letter", { w: number; h: number }> = {
  A4: { w: 793.7, h: 1122.5 },
  Letter: { w: 816, h: 1056 },
};

export default function MeasureCv({
  cv,
  template,
  density,
  pageSize,
  bulletStyle,
  bulletSpacing,
  onMeasure,
}: {
  cv: CVData;
  template: TemplateId;
  density: Density;
  pageSize: "A4" | "Letter";
  bulletStyle: "dot" | "dash" | "none";
  bulletSpacing: "compact" | "normal" | "roomy";
  onMeasure: (heightPx: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagePx = PAGE_PX[pageSize];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      onMeasure(el.scrollHeight);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [cv, template, density, pageSize, bulletStyle, bulletSpacing, onMeasure]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: -99999,
        width: pagePx.w,
        height: "auto",
        pointerEvents: "none",
        opacity: 0,
        zIndex: -1,
      }}
    >
      <div style={{ width: pagePx.w, minHeight: pagePx.h }}>
        <CvPage
          cv={cv}
          template={template}
          density={density}
          pageSize={pageSize}
          bulletStyle={bulletStyle}
          bulletSpacing={bulletSpacing}
        />
      </div>
    </div>
  );
}