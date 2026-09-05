"use client";

import { Check } from "lucide-react";
import type { TemplateId } from "@/lib/cv-data";
import { templates } from "@/lib/cv-data";

/** Miniature CSS thumbnail of each layout — no images. */
function TemplateThumb({ id }: { id: TemplateId }) {
  if (id === "folio") {
    return (
      <div className="flex h-full flex-col p-2">
        <div className="border-b border-stone-900 pb-1.5">
          <div className="h-1.5 w-2/3 bg-stone-900" />
          <div className="mt-1 h-0.5 w-1/3 bg-rust" />
        </div>
        <div className="mt-1.5 space-y-1">
          <div className="h-0.5 w-full bg-stone-300" />
          <div className="h-0.5 w-5/6 bg-stone-300" />
          <div className="h-0.5 w-4/6 bg-stone-300" />
        </div>
        <div className="mt-1.5 h-0.5 w-1/4 bg-rust" />
        <div className="mt-1 space-y-1">
          <div className="h-0.5 w-full bg-stone-300" />
          <div className="h-0.5 w-3/4 bg-stone-300" />
        </div>
      </div>
    );
  }
  if (id === "ledger") {
    return (
      <div className="flex h-full">
        <div className="w-2/5 bg-stone-900 p-1.5">
          <div className="h-0.5 w-3/4 bg-orange-400" />
          <div className="mt-1 space-y-1">
            <div className="h-0.5 w-full bg-stone-600" />
            <div className="h-0.5 w-full bg-stone-600" />
            <div className="h-0.5 w-4/5 bg-stone-600" />
          </div>
        </div>
        <div className="flex-1 p-1.5">
          <div className="h-1.5 w-2/3 bg-stone-900" />
          <div className="mt-1 space-y-1">
            <div className="h-0.5 w-full bg-stone-300" />
            <div className="h-0.5 w-5/6 bg-stone-300" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col p-2">
      <div className="h-1.5 w-1/2 bg-stone-900" />
      <div className="mt-1 h-0.5 w-1/3 bg-rust" />
      <div className="mt-1.5 space-y-1.5">
        <div className="h-0.5 w-full bg-stone-900" />
        <div className="ml-2 space-y-0.5">
          <div className="h-0.5 w-full bg-stone-300" />
          <div className="h-0.5 w-4/5 bg-stone-300" />
        </div>
        <div className="h-0.5 w-full bg-stone-900" />
        <div className="ml-2 space-y-0.5">
          <div className="h-0.5 w-full bg-stone-300" />
          <div className="h-0.5 w-3/4 bg-stone-300" />
        </div>
      </div>
    </div>
  );
}

export default function TemplatesTab({
  template,
  setTemplate,
}: {
  template: TemplateId;
  setTemplate: (t: TemplateId) => void;
}) {
  return (
    <div className="space-y-3 border-t border-stone-200 p-4">
      <p className="text-sm leading-6 text-stone-600">
        Switching layouts keeps every field you've filled in and reflows it into
        the new design.
      </p>
      {templates.map((t) => {
        const active = t.id === template;
        return (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`flex w-full items-start gap-4 border p-3 text-left ${
              active
                ? "border-rust bg-orange-50"
                : "border-stone-300 bg-white hover:border-stone-900"
            }`}
          >
            <div
              className={`aspect-[1/1.414] w-16 shrink-0 border bg-white ${
                active ? "border-rust" : "border-stone-300"
              }`}
            >
              <TemplateThumb id={t.id} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold tracking-tightish text-ink">
                  {t.name}
                </span>
                {active && (
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-rust">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-5 text-stone-600">
                {t.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
