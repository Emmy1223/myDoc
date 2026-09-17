"use client";

import type { Density } from "@/lib/cv-data";
import { Field } from "./fields";

export default function SettingsTab({
  docName,
  setDocName,
  pageSize,
  setPageSize,
  density,
  setDensity,
  showGuides,
  setShowGuides,
  autoSave,
  setAutoSave,
  autoFit,
  setAutoFit,
}: {
  docName: string;
  setDocName: (v: string) => void;
  pageSize: "A4" | "Letter";
  setPageSize: (v: "A4" | "Letter") => void;
  density: Density;
  setDensity: (v: Density) => void;
  showGuides: boolean;
  setShowGuides: (v: boolean) => void;
  autoSave: boolean;
  setAutoSave: (v: boolean) => void;
  autoFit: boolean;
  setAutoFit: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6 border-t border-stone-200 p-4">
      <div>
        <h3 className="font-display text-sm font-bold tracking-tightish text-ink">
          Document
        </h3>
        <div className="mt-3">
          <Field
            label="Document name"
            value={docName}
            placeholder="Product Designer CV"
            onChange={setDocName}
          />
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold tracking-tightish text-ink">
          Page size
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["A4", "Letter"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`border px-3 py-2.5 text-sm font-semibold ${
                pageSize === size
                  ? "border-rust bg-orange-50 text-rust"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold tracking-tightish text-ink">
          Content density
        </h3>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {(
            [
              ["auto", "Auto"],
              ["compact", "Compact"],
              ["normal", "Normal"],
              ["roomy", "Roomy"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDensity(value as Density)}
              className={`border px-2 py-2.5 text-xs font-semibold ${
                density === value
                  ? "border-rust bg-orange-50 text-rust"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">
          {density === "auto"
            ? "Auto picks the tightest layout that fits your CV on two pages."
            : density === "compact"
              ? "Compact: tightest spacing. Best for long CVs."
              : density === "normal"
                ? "Normal: balanced spacing. Good default."
                : "Roomy: generous spacing. Best for short CVs."}
        </p>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold tracking-tightish text-ink">
          Preferences
        </h3>
        <div className="mt-3 divide-y divide-stone-200 border border-stone-200">
          <ToggleRow
            label="Auto-fit to two pages"
            hint="Reduce spacing and font size automatically if your CV exceeds two pages."
            checked={autoFit}
            onChange={setAutoFit}
          />
          <ToggleRow
            label="Show page guides"
            hint="Display margin rulers on the preview"
            checked={showGuides}
            onChange={setShowGuides}
          />
          <ToggleRow
            label="Auto-save while editing"
            hint="Save changes as you type"
            checked={autoSave}
            onChange={setAutoSave}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 px-3 py-3 text-left hover:bg-stone-50"
    >
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-xs text-stone-500">{hint}</p>
      </div>
      <span
        className={`relative h-5 w-9 shrink-0 border ${
          checked ? "border-rust bg-rust" : "border-stone-300 bg-white"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 bg-white transition-all ${
            checked ? "left-[18px]" : "left-0.5 bg-stone-400"
          }`}
          style={{ border: "1px solid rgba(0,0,0,0.15)" }}
        />
      </span>
    </button>
  );
}