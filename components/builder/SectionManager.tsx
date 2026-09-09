// components/builder/SectionManager.tsx
"use client";

import { useState } from "react";
import { X, Check, Plus } from "lucide-react";
import { AVAILABLE_SECTIONS } from "@/lib/cv-data";

interface SectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  enabledSections: string[];
  onToggleSection: (sectionId: string, enabled: boolean) => void;
}

export default function SectionManager({
  isOpen,
  onClose,
  enabledSections,
  onToggleSection,
}: SectionManagerProps) {
  if (!isOpen) return null;

  // Group sections into "Always On" and "Optional"
  const requiredSections = AVAILABLE_SECTIONS.filter(s => s.required);
  const optionalSections = AVAILABLE_SECTIONS.filter(s => !s.required);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Add Content</h2>
            <p className="mt-1 text-sm text-stone-500">Choose sections to add to your CV</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-stone-100"
          >
            <X className="h-5 w-5 text-stone-500" strokeWidth={2} />
          </button>
        </div>

        {/* Required Sections (always shown) */}
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Core Sections</h3>
          <div className="space-y-2">
            {requiredSections.map((section) => (
              <div
                key={section.id}
                className="flex items-start gap-3 rounded border border-stone-200 bg-stone-50 p-3 opacity-75"
              >
                <div className="mt-0.5">
                  <div className="h-5 w-5 rounded border border-rust bg-rust/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-rust" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{section.label}</p>
                  <p className="text-xs text-stone-500">{section.description}</p>
                </div>
                <span className="text-xs font-medium text-stone-400">Always included</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Sections */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Add More Sections</h3>
          <div className="space-y-2">
            {optionalSections.map((section) => {
              const isEnabled = enabledSections.includes(section.id);
              return (
                <button
                  key={section.id}
                  onClick={() => onToggleSection(section.id, !isEnabled)}
                  className={`flex w-full items-start gap-3 rounded border p-3 text-left transition-all ${
                    isEnabled
                      ? "border-rust bg-rust/5 hover:bg-rust/10"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        isEnabled
                          ? "border-rust bg-rust text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {isEnabled && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isEnabled ? "text-rust" : "text-ink"}`}>
                      {section.label}
                    </p>
                    <p className="text-xs text-stone-500">{section.description}</p>
                  </div>
                  {isEnabled && (
                    <span className="text-xs font-medium text-rust">Added</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-stone-200 pt-4">
          <button
            onClick={onClose}
            className="w-full rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:border-stone-900 hover:text-ink"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}