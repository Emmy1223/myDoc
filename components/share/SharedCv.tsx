"use client";

import { useEffect, useRef, useState } from "react";
import type { CVData, TemplateId } from "@/lib/cv-data";
import CvPage from "@/components/builder/CvPage";

const PAGE_W = 793.7;
const PAGE_H = 1122.5;

export default function SharedCv({
  cv,
  template,
}: {
  cv: CVData;
  template: TemplateId;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const available = el.clientWidth;
      if (available <= 0) return;
      setScale(Math.min(1, available / PAGE_W));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto w-full max-w-[210mm]">
      <div
        className="mx-auto"
        style={{
          width: PAGE_W * scale,
          height: PAGE_H * scale,
        }}
      >
        <div
          className="bg-white shadow-sm"
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <CvPage cv={cv} template={template} density="normal" pageSize="A4" />
        </div>
      </div>
    </div>
  );
}