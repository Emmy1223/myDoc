"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CVData, ExperienceItem, EducationItem } from "@/lib/cv-data";
import { uid } from "@/lib/cv-data";

// Add this type export so it can be used elsewhere
export type BulletStyle = "dot" | "dash" | "none";
export type BulletSpacing = "compact" | "normal" | "roomy";

/* ------------------------------ atoms ------------------------------ */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:border-rust"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y border border-stone-300 bg-white px-3 py-2 text-sm leading-6 text-ink placeholder:text-stone-400 focus:border-rust"
      />
    </label>
  );
}

/* --------------------------- skills editor -------------------------- */

export function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  function remove(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }
  function add(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = (e.target as HTMLInputElement).value.trim();
      if (v && !skills.includes(v)) onChange([...skills, v]);
      (e.target as HTMLInputElement).value = "";
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
        Skills
      </span>
      <div className="flex flex-wrap gap-1.5 border border-stone-300 bg-white p-2">
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700"
          >
            {s}
            <button
              onClick={() => remove(s)}
              className="text-stone-400 hover:text-rust"
              aria-label={`Remove ${s}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          onKeyDown={add}
          placeholder={skills.length ? "Add another + Enter" : "Type a skill, press Enter"}
          className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm placeholder:text-stone-400"
        />
      </div>
    </div>
  );
}

/* ------------------------- experience editor ------------------------ */

export function ExperienceEditor({
  items,
  onChange,
  bulletStyle: externalBulletStyle,
  bulletSpacing: externalBulletSpacing,
  onBulletStyleChange,
  onBulletSpacingChange,
}: {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
  bulletStyle?: BulletStyle;
  bulletSpacing?: BulletSpacing;
  onBulletStyleChange?: (style: BulletStyle) => void;
  onBulletSpacingChange?: (spacing: BulletSpacing) => void;
}) {
  // Use external state if provided, otherwise use internal state
  const [internalBulletStyle, setInternalBulletStyle] = useState<BulletStyle>("dash");
  const [internalBulletSpacing, setInternalBulletSpacing] = useState<BulletSpacing>("compact");

  const bulletStyle = externalBulletStyle ?? internalBulletStyle;
  const bulletSpacing = externalBulletSpacing ?? internalBulletSpacing;

  const handleBulletStyleChange = (style: BulletStyle) => {
    if (onBulletStyleChange) {
      onBulletStyleChange(style);
    } else {
      setInternalBulletStyle(style);
    }
  };

  const handleBulletSpacingChange = (spacing: BulletSpacing) => {
    if (onBulletSpacingChange) {
      onBulletSpacingChange(spacing);
    } else {
      setInternalBulletSpacing(spacing);
    }
  };

  function update(id: string, patch: Partial<ExperienceItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function add() {
    onChange([
      ...items,
      {
        id: uid(),
        role: "",
        company: "",
        location: "",
        start: "",
        end: "",
        bullets: "",
      },
    ]);
  }
  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  const getBulletSymbol = (style: BulletStyle) => {
    switch (style) {
      case "dot": return "·";
      case "dash": return "-";
      case "none": return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Bullet Style Controls */}
      <div className="rounded-md border border-stone-200 bg-stone-50 p-3 space-y-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-medium text-stone-600">Bullet style:</span>
          <div className="flex gap-2">
            {(["dot", "dash", "none"] as const).map((style) => (
              <button
                key={style}
                onClick={() => handleBulletStyleChange(style)}
                className={`px-3 py-1 text-xs font-medium rounded border ${
                  bulletStyle === style
                    ? "border-rust bg-rust/10 text-rust"
                    : "border-stone-300 text-stone-600 hover:border-stone-400"
                }`}
              >
                {style === "dot" && "· Dot"}
                {style === "dash" && "- Dash"}
                {style === "none" && "None"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-medium text-stone-600">Spacing:</span>
          <div className="flex gap-2">
            {(["compact", "normal", "roomy"] as const).map((spacing) => (
              <button
                key={spacing}
                onClick={() => handleBulletSpacingChange(spacing)}
                className={`px-3 py-1 text-xs font-medium rounded border ${
                  bulletSpacing === spacing
                    ? "border-rust bg-rust/10 text-rust"
                    : "border-stone-300 text-stone-600 hover:border-stone-400"
                }`}
              >
                {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {items.map((exp, i) => (
        <div key={exp.id} className="border border-stone-200 bg-stone-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Role {i + 1}
            </span>
            <button
              onClick={() => remove(exp.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-rust"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Remove
            </button>
          </div>
          <div className="space-y-2.5">
            <Field
              label="Job title"
              value={exp.role}
              placeholder="Senior Product Designer"
              onChange={(v) => update(exp.id, { role: v })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="Company"
                value={exp.company}
                placeholder="Northwind"
                onChange={(v) => update(exp.id, { company: v })}
              />
              <Field
                label="Location"
                value={exp.location}
                placeholder="London"
                onChange={(v) => update(exp.id, { location: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="Start"
                value={exp.start}
                placeholder="2022"
                onChange={(v) => update(exp.id, { start: v })}
              />
              <Field
                label="End"
                value={exp.end}
                placeholder="Present"
                onChange={(v) => update(exp.id, { end: v })}
              />
            </div>
            <TextArea
              label="Achievements (one per line)"
              rows={3}
              value={exp.bullets}
              placeholder={"Led the redesign of…\nReduced drop-off by…"}
              onChange={(v) => update(exp.id, { bullets: v })}
            />
            
            {/* Preview of how bullets will look */}
            {exp.bullets.trim() && (
              <div className="mt-1 rounded border border-stone-200 bg-white p-3">
                <p className="text-xs font-medium text-stone-500 mb-2">Preview:</p>
                <div className={`space-y-[${
                  bulletSpacing === "compact" ? "1px" : 
                  bulletSpacing === "normal" ? "2px" : "3px"
                }]`}>
                  {exp.bullets.split("\n").filter(b => b.trim()).map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-stone-700">
                      {bulletStyle !== "none" && (
                        <span className="text-stone-500 min-w-[14px]">{getBulletSymbol(bulletStyle)}</span>
                      )}
                      <span>{b.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2.5 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add role
      </button>
    </div>
  );
}

/* -------------------------- education editor ------------------------ */

export function EducationEditor({
  items,
  onChange,
}: {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}) {
  function update(id: string, patch: Partial<EducationItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function add() {
    onChange([
      ...items,
      { id: uid(), degree: "", school: "", start: "", end: "", detail: "" },
    ]);
  }
  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-4">
      {items.map((ed, i) => (
        <div key={ed.id} className="border border-stone-200 bg-stone-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Qualification {i + 1}
            </span>
            <button
              onClick={() => remove(ed.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-rust"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Remove
            </button>
          </div>
          <div className="space-y-2.5">
            <Field
              label="Degree / qualification"
              value={ed.degree}
              placeholder="BA (Hons) Graphic Design"
              onChange={(v) => update(ed.id, { degree: v })}
            />
            <Field
              label="Institution"
              value={ed.school}
              placeholder="University of the Arts London"
              onChange={(v) => update(ed.id, { school: v })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="Start"
                value={ed.start}
                placeholder="2013"
                onChange={(v) => update(ed.id, { start: v })}
              />
              <Field
                label="End"
                value={ed.end}
                placeholder="2016"
                onChange={(v) => update(ed.id, { end: v })}
              />
            </div>
            <TextArea
              label="Details"
              rows={2}
              value={ed.detail}
              placeholder="Honours, thesis, relevant coursework"
              onChange={(v) => update(ed.id, { detail: v })}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2.5 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add qualification
      </button>
    </div>
  );
}

/* --------------------------- update helpers ------------------------- */

export function patchField<K extends keyof CVData>(
  cv: CVData,
  setCv: (updater: (prev: CVData) => CVData) => void,
  key: K,
  value: CVData[K]
) {
  setCv((prev) => ({ ...prev, [key]: value }));
}