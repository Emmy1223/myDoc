"use client";

import { useEffect, useRef, useState } from "react";
import { Type } from "lucide-react";
import { DOC_FONTS } from "@/lib/doc-data";

export default function DocFontPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = DOC_FONTS.find((f) => f.id === value) ?? DOC_FONTS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rust hover:text-rust disabled:cursor-not-allowed disabled:opacity-50 md:gap-2 md:px-3 md:py-2 md:text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Type className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2} />
        <span className="hidden sm:inline">{current.name}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-1 w-56 border border-stone-200 bg-white py-1 shadow-lg"
        >
          {DOC_FONTS.map((font) => {
            const selected = font.id === value;
            return (
              <button
                key={font.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(font.id);
                  setOpen(false);
                }}
                style={{ fontFamily: font.css }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? "bg-orange-50 font-medium text-ink"
                    : "text-stone-700 hover:bg-stone-50 hover:text-ink"
                }`}
              >
                <span>{font.name}</span>
                {selected && (
                  <span className="text-xs font-bold text-rust">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}