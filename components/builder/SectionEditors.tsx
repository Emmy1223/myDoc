// components/builder/SectionEditors.tsx
"use client";

import { Plus, Trash2 } from "lucide-react";
import { Field, TextArea } from "./fields";
import { uid, type LanguageItem, type CertificateItem, type ProjectItem, type PublicationItem, type CourseItem, type OrganizationItem, type InterestItem, type ReferenceItem, type AwardItem, type DeclarationItem, type CustomSectionItem } from "@/lib/cv-data";

// ============================================================
// LANGUAGES EDITOR
// ============================================================
export function LanguagesEditor({
  items,
  onChange,
}: {
  items: LanguageItem[];
  onChange: (items: LanguageItem[]) => void;
}) {
  const proficiencies = ["Native", "Fluent", "Professional", "Intermediate", "Basic"];

  function update(id: string, field: keyof LanguageItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", proficiency: "Professional" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Language</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Language"
              value={item.name}
              placeholder="e.g., English, Spanish"
              onChange={(v) => update(item.id, "name", v)}
            />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Proficiency
              </label>
              <select
                value={item.proficiency}
                onChange={(e) => update(item.id, "proficiency", e.target.value)}
                className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-ink focus:border-rust"
              >
                {proficiencies.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Language
      </button>
    </div>
  );
}

// ============================================================
// CERTIFICATES EDITOR
// ============================================================
export function CertificatesEditor({
  items,
  onChange,
}: {
  items: CertificateItem[];
  onChange: (items: CertificateItem[]) => void;
}) {
  function update(id: string, field: keyof CertificateItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", issuer: "", date: "", link: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Certificate</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Certificate name"
              value={item.name}
              placeholder="e.g., AWS Certified Solutions Architect"
              onChange={(v) => update(item.id, "name", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Issuer"
                value={item.issuer}
                placeholder="e.g., Amazon Web Services"
                onChange={(v) => update(item.id, "issuer", v)}
              />
              <Field
                label="Date earned"
                value={item.date}
                placeholder="e.g., 2023"
                onChange={(v) => update(item.id, "date", v)}
              />
            </div>
            <Field
              label="Link (optional)"
              value={item.link || ""}
              placeholder="https://..."
              onChange={(v) => update(item.id, "link", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Certificate
      </button>
    </div>
  );
}

// ============================================================
// PROJECTS EDITOR
// ============================================================
export function ProjectsEditor({
  items,
  onChange,
}: {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}) {
  function update(id: string, field: keyof ProjectItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", description: "", role: "", link: "", technologies: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Project</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Project name"
              value={item.name}
              placeholder="e.g., E-commerce Platform Redesign"
              onChange={(v) => update(item.id, "name", v)}
            />
            <Field
              label="Role"
              value={item.role}
              placeholder="e.g., Lead Developer, Product Designer"
              onChange={(v) => update(item.id, "role", v)}
            />
            <TextArea
              label="Description"
              rows={2}
              value={item.description}
              placeholder="Describe the project and your impact..."
              onChange={(v) => update(item.id, "description", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Technologies used (optional)"
                value={item.technologies || ""}
                placeholder="e.g., React, Python, AWS"
                onChange={(v) => update(item.id, "technologies", v)}
              />
              <Field
                label="Link (optional)"
                value={item.link || ""}
                placeholder="https://..."
                onChange={(v) => update(item.id, "link", v)}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Project
      </button>
    </div>
  );
}

// ============================================================
// PUBLICATIONS EDITOR
// ============================================================
export function PublicationsEditor({
  items,
  onChange,
}: {
  items: PublicationItem[];
  onChange: (items: PublicationItem[]) => void;
}) {
  function update(id: string, field: keyof PublicationItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), title: "", publisher: "", date: "", link: "", description: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Publication</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Title"
              value={item.title}
              placeholder="e.g., Designing Accessible Interfaces"
              onChange={(v) => update(item.id, "title", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Publisher"
                value={item.publisher}
                placeholder="e.g., UX Magazine"
                onChange={(v) => update(item.id, "publisher", v)}
              />
              <Field
                label="Date"
                value={item.date}
                placeholder="e.g., 2023"
                onChange={(v) => update(item.id, "date", v)}
              />
            </div>
            <Field
              label="Link (optional)"
              value={item.link || ""}
              placeholder="https://..."
              onChange={(v) => update(item.id, "link", v)}
            />
            <TextArea
              label="Description (optional)"
              rows={2}
              value={item.description || ""}
              placeholder="Brief description of the publication..."
              onChange={(v) => update(item.id, "description", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Publication
      </button>
    </div>
  );
}

// ============================================================
// COURSES EDITOR
// ============================================================
export function CoursesEditor({
  items,
  onChange,
}: {
  items: CourseItem[];
  onChange: (items: CourseItem[]) => void;
}) {
  function update(id: string, field: keyof CourseItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", provider: "", date: "", link: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Course</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Course name"
              value={item.name}
              placeholder="e.g., Advanced React Patterns"
              onChange={(v) => update(item.id, "name", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Provider"
                value={item.provider}
                placeholder="e.g., Coursera, Udemy"
                onChange={(v) => update(item.id, "provider", v)}
              />
              <Field
                label="Date completed"
                value={item.date}
                placeholder="e.g., 2023"
                onChange={(v) => update(item.id, "date", v)}
              />
            </div>
            <Field
              label="Link (optional)"
              value={item.link || ""}
              placeholder="https://..."
              onChange={(v) => update(item.id, "link", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Course
      </button>
    </div>
  );
}

// ============================================================
// ORGANIZATIONS EDITOR
// ============================================================
export function OrganizationsEditor({
  items,
  onChange,
}: {
  items: OrganizationItem[];
  onChange: (items: OrganizationItem[]) => void;
}) {
  function update(id: string, field: keyof OrganizationItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", role: "", start: "", end: "", description: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Organization</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Organization name"
              value={item.name}
              placeholder="e.g., Rotary Club, ACM"
              onChange={(v) => update(item.id, "name", v)}
            />
            <Field
              label="Role"
              value={item.role}
              placeholder="e.g., President, Volunteer"
              onChange={(v) => update(item.id, "role", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Start date"
                value={item.start}
                placeholder="e.g., 2020"
                onChange={(v) => update(item.id, "start", v)}
              />
              <Field
                label="End date"
                value={item.end}
                placeholder="e.g., 2022"
                onChange={(v) => update(item.id, "end", v)}
              />
            </div>
            <TextArea
              label="Description (optional)"
              rows={2}
              value={item.description || ""}
              placeholder="Describe your involvement and contributions..."
              onChange={(v) => update(item.id, "description", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Organization
      </button>
    </div>
  );
}

// ============================================================
// INTERESTS EDITOR
// ============================================================
export function InterestsEditor({
  items,
  onChange,
}: {
  items: InterestItem[];
  onChange: (items: InterestItem[]) => void;
}) {
  function add() {
    onChange([...items, { id: uid(), name: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  function update(id: string, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, name: value } : it)));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            value={item.name}
            onChange={(e) => update(item.id, e.target.value)}
            placeholder="e.g., Photography, Hiking, Chess"
            className="flex-1 border border-stone-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:border-rust"
          />
          <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Interest
      </button>
    </div>
  );
}

// ============================================================
// REFERENCES EDITOR
// ============================================================
export function ReferencesEditor({
  items,
  onChange,
}: {
  items: ReferenceItem[];
  onChange: (items: ReferenceItem[]) => void;
}) {
  function update(id: string, field: keyof ReferenceItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", position: "", company: "", email: "", phone: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Reference</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Full name"
              value={item.name}
              placeholder="e.g., Jane Smith"
              onChange={(v) => update(item.id, "name", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Position"
                value={item.position}
                placeholder="e.g., Engineering Manager"
                onChange={(v) => update(item.id, "position", v)}
              />
              <Field
                label="Company"
                value={item.company}
                placeholder="e.g., Google"
                onChange={(v) => update(item.id, "company", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Email"
                type="email"
                value={item.email}
                placeholder="jane@example.com"
                onChange={(v) => update(item.id, "email", v)}
              />
              <Field
                label="Phone"
                value={item.phone}
                placeholder="+1 234 567 8900"
                onChange={(v) => update(item.id, "phone", v)}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Reference
      </button>
    </div>
  );
}

// ============================================================
// AWARDS EDITOR
// ============================================================
export function AwardsEditor({
  items,
  onChange,
}: {
  items: AwardItem[];
  onChange: (items: AwardItem[]) => void;
}) {
  function update(id: string, field: keyof AwardItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), name: "", issuer: "", date: "", description: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Award</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Award name"
              value={item.name}
              placeholder="e.g., Best Design Award 2023"
              onChange={(v) => update(item.id, "name", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Issuer"
                value={item.issuer}
                placeholder="e.g., Design Association"
                onChange={(v) => update(item.id, "issuer", v)}
              />
              <Field
                label="Date received"
                value={item.date}
                placeholder="e.g., 2023"
                onChange={(v) => update(item.id, "date", v)}
              />
            </div>
            <TextArea
              label="Description (optional)"
              rows={2}
              value={item.description || ""}
              placeholder="Brief description of the award..."
              onChange={(v) => update(item.id, "description", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Award
      </button>
    </div>
  );
}

// ============================================================
// DECLARATION EDITOR
// ============================================================
export function DeclarationEditor({
  items,
  onChange,
}: {
  items: DeclarationItem[];
  onChange: (items: DeclarationItem[]) => void;
}) {
  function update(id: string, field: keyof DeclarationItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), text: "", signature: "", date: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Declaration</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <TextArea
              label="Declaration text"
              rows={3}
              value={item.text}
              placeholder="I hereby declare that the information provided is true and correct..."
              onChange={(v) => update(item.id, "text", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Signature (optional)"
                value={item.signature || ""}
                placeholder="Type your name or upload signature"
                onChange={(v) => update(item.id, "signature", v)}
              />
              <Field
                label="Date (optional)"
                value={item.date || ""}
                placeholder="e.g., 2024-01-01"
                onChange={(v) => update(item.id, "date", v)}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Declaration
      </button>
    </div>
  );
}

// ============================================================
// CUSTOM SECTION EDITOR
// ============================================================
export function CustomSectionEditor({
  items,
  onChange,
}: {
  items: CustomSectionItem[];
  onChange: (items: CustomSectionItem[]) => void;
}) {
  function update(id: string, field: keyof CustomSectionItem, value: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function add() {
    onChange([...items, { id: uid(), title: "", content: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Custom Section</span>
            <button onClick={() => remove(item.id)} className="text-stone-400 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <Field
              label="Section title"
              value={item.title}
              placeholder="e.g., Volunteer Work, Portfolio"
              onChange={(v) => update(item.id, "title", v)}
            />
            <TextArea
              label="Content"
              rows={4}
              value={item.content}
              placeholder="Add your custom content here..."
              onChange={(v) => update(item.id, "content", v)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 py-2 text-sm font-semibold text-stone-600 hover:border-rust hover:text-rust"
      >
        <Plus className="h-4 w-4" /> Add Custom Section
      </button>
    </div>
  );
}