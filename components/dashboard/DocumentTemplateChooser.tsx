"use client";

import { useEffect } from "react";
import {
  X,
  FileText,
  ClipboardList,
  FileBarChart,
  NotebookPen,
  Receipt,
} from "lucide-react";
import { docTemplates, type DocTemplateId } from "@/lib/doc-data";

const templateIcons: Record<DocTemplateId, typeof FileText> = {
  blank: FileText,
  "project-brief": ClipboardList,
  report: FileBarChart,
  "meeting-notes": NotebookPen,
  invoice: Receipt,
};

const templateColors: Record<
  DocTemplateId,
  { bg: string; border: string; icon: string }
> = {
  blank: {
    bg: "bg-stone-50",
    border: "border-stone-200",
    icon: "text-stone-500",
  },
  "project-brief": {
    bg: "bg-orange-50",
    border: "border-rust/20",
    icon: "text-rust",
  },
  report: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
  },
  "meeting-notes": {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
  },
  invoice: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "text-purple-600",
  },
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
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              New document
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tightish text-ink">
              Choose a starting point
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Pick a template, or start from a blank page.
            </p>
          </div>
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

        {/* Template grid */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docTemplates.map((tpl) => {
              const Icon = templateIcons[tpl.id] ?? FileText;
              const colors = templateColors[tpl.id] ?? templateColors.blank;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  disabled={creating}
                  onClick={() => onPick(tpl.id)}
                  className="group flex flex-col border border-stone-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-rust hover:shadow-md disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center border ${colors.border} ${colors.bg}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${colors.icon}`}
                      strokeWidth={1.75}
                    />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold tracking-tightish text-ink">
                    {tpl.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {tpl.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-stone-400 transition-colors group-hover:text-rust">
                    Use this template
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}