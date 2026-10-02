// components/builder/doc/DocListRail.tsx
"use client";

import { useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import {
  docTemplates,
  type DocTemplate,
  type RichDocNode,
} from "@/lib/doc-data";

export type DocListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function DocListRail({
  documents,
  activeId,
  onSelect,
  onCreate,
}: {
  documents: DocListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (
    templateId: string,
    initialBody: RichDocNode,
    name: string,
  ) => Promise<void>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handlePick = async (tpl: DocTemplate) => {
    setCreating(true);
    try {
      await onCreate(tpl.id, tpl.build(), tpl.name);
      setPickerOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white print-hidden">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Documents
        </span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-7 w-7 items-center justify-center border border-stone-300 text-stone-600 hover:border-rust hover:text-rust"
          aria-label="New document"
          title="New document"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <p className="px-4 py-6 text-xs text-stone-400">
            No documents yet. Click + to start one.
          </p>
        ) : (
          <ul>
            {documents.map((d) => {
              const active = d.id === activeId;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(d.id)}
                    className={`flex w-full items-center gap-2 border-l-2 px-4 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "border-rust bg-orange-50 font-medium text-ink"
                        : "border-transparent text-stone-600 hover:bg-stone-50 hover:text-ink"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1 truncate">{d.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-[min(90vw,480px)] border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-ink">
                New document
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="border border-stone-300 p-1 text-stone-500 hover:border-ink hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <ul className="p-2">
              {docTemplates.map((tpl) => (
                <li key={tpl.id}>
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => handlePick(tpl)}
                    className="w-full border border-transparent px-4 py-3 text-left transition-colors hover:border-stone-200 hover:bg-stone-50 disabled:opacity-50"
                  >
                    <p className="text-sm font-semibold text-ink">{tpl.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {tpl.description}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}