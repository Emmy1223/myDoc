"use client";

import { useEffect, useState } from "react";
import { X, FileText, ClipboardList, FileBarChart, NotebookPen } from "lucide-react";
import { docTemplates, type DocTemplateId } from "@/lib/doc-data";

const templateIcons: Record<DocTemplateId, typeof FileText> = {
  blank: FileText,
  "project-brief": ClipboardList,
  report: FileBarChart,
  "meeting-notes": NotebookPen,
};

export default function DocumentTemplateChooser({
  open,
  onClose,
  onPick,
  creating,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (templateId: DocTemplateId) => void;
  creating?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <p className="font-display text-base font-bold tracking-tightish text-ink">
            Choose a template
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="border border-transparent p-2 text-stone-500 transition-colors hover:border-stone-300 hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Cards */}
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {docTemplates.map((tpl) => {
            const Icon = templateIcons[tpl.id] ?? FileText;
            return (
              <button
                key={tpl.id}
                type="button"
                disabled={creating}
                onClick={() => onPick(tpl.id)}
                className="flex flex-col items-start gap-3 border border-stone-200 bg-white p-5 text-left transition-colors hover:border-rust hover:bg-orange-50/40 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="flex h-10 w-10 items-center justify-center border border-stone-200 bg-stone-50">
                  <Icon className="h-4 w-4 text-stone-600" strokeWidth={1.75} />
                </span>
                <span className="font-display text-base font-bold tracking-tightish text-ink">
                  {tpl.name}
                </span>
                <span className="text-xs leading-5 text-stone-500">
                  {tpl.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}