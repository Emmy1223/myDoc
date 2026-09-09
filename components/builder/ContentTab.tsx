// components/builder/ContentTab.tsx
"use client";

import { useState } from "react";
import { ChevronDown, User, Briefcase, GraduationCap, Wrench, Plus, Trash2, AlertTriangle } from "lucide-react";
import type { CVData } from "@/lib/cv-data";
import {
  Field,
  TextArea,
  SkillsEditor,
  ExperienceEditor,
  EducationEditor,
} from "./fields";
import {
  LanguagesEditor,
  CertificatesEditor,
  ProjectsEditor,
  PublicationsEditor,
  CoursesEditor,
  OrganizationsEditor,
  InterestsEditor,
  ReferencesEditor,
  AwardsEditor,
  DeclarationEditor,
  CustomSectionEditor,
} from "./SectionEditors";
import SectionManager from "./SectionManager";
import { AVAILABLE_SECTIONS, DEFAULT_SECTION_ORDER } from "@/lib/cv-data";
import type { BulletStyle, BulletSpacing } from "./fields";

type SectionKey = "personal" | "experience" | "education" | "skills";

// All section IDs that can be toggled
export type ToggleableSection = 
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certificates"
  | "projects"
  | "publications"
  | "courses"
  | "organizations"
  | "interests"
  | "references"
  | "awards"
  | "declaration"
  | "custom";

// Fixed order for sections
const SECTION_ORDER: ToggleableSection[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "certificates",
  "projects",
  "publications",
  "courses",
  "organizations",
  "interests",
  "references",
  "awards",
  "declaration",
  "custom"
];

// Section label mapping
const SECTION_LABELS: Record<ToggleableSection, string> = {
  summary: "Summary",
  experience: "Professional Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  certificates: "Certificates",
  projects: "Projects",
  publications: "Publications",
  courses: "Courses",
  organizations: "Organizations",
  interests: "Interests",
  references: "References",
  awards: "Awards",
  declaration: "Declaration",
  custom: "Custom",
};

// Get section description
function getSectionDescription(id: string): string {
  const section = AVAILABLE_SECTIONS.find(s => s.id === id);
  return section?.description || "";
}

// Check if a section is required (always shown)
function isRequiredSection(id: string): boolean {
  const section = AVAILABLE_SECTIONS.find(s => s.id === id);
  return section?.required || false;
}

// Type guard to check if a string is a valid ToggleableSection
function isToggleableSection(id: string): id is ToggleableSection {
  return SECTION_ORDER.includes(id as ToggleableSection);
}

export default function ContentTab({
  cv,
  setCv,
  bulletStyle = "dash",
  bulletSpacing = "compact",
  onBulletStyleChange,
  onBulletSpacingChange,
}: {
  cv: CVData;
  setCv: (updater: (prev: CVData) => CVData) => void;
  bulletStyle?: BulletStyle;
  bulletSpacing?: BulletSpacing;
  onBulletStyleChange?: (style: BulletStyle) => void;
  onBulletSpacingChange?: (spacing: BulletSpacing) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    personal: true,
  });
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get enabled sections (always show required ones)
  const enabledSections = SECTION_ORDER.filter(id => {
    const section = AVAILABLE_SECTIONS.find(s => s.id === id);
    if (section?.required) return true;
    // Check if section has data or is enabled
    const hasData = hasSectionData(id, cv);
    return hasData || cv.sectionOrder?.includes(id) || false;
  });

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function hasSectionData(id: ToggleableSection, data: CVData): boolean {
    switch (id) {
      case "summary": return !!data.summary?.trim();
      case "experience": return data.experience.length > 0;
      case "education": return data.education.length > 0;
      case "skills": return data.skills.length > 0;
      case "languages": return data.languages.length > 0;
      case "certificates": return data.certificates.length > 0;
      case "projects": return data.projects.length > 0;
      case "publications": return data.publications.length > 0;
      case "courses": return data.courses.length > 0;
      case "organizations": return data.organizations.length > 0;
      case "interests": return data.interests.length > 0;
      case "references": return data.references.length > 0;
      case "awards": return data.awards.length > 0;
      case "declaration": return data.declaration.length > 0;
      case "custom": return data.custom.length > 0;
      default: return false;
    }
  }

  function toggleSection(sectionId: string, enabled: boolean) {
    // Use type guard to ensure we have a valid ToggleableSection
    if (!isToggleableSection(sectionId)) return;
    
    const section = AVAILABLE_SECTIONS.find(s => s.id === sectionId);
    if (section?.required) return;

    setCv((prev) => {
      const currentOrder = prev.sectionOrder || DEFAULT_SECTION_ORDER;
      let newOrder = [...currentOrder];
      
      if (enabled) {
        // Add section if not already in order
        if (!newOrder.includes(sectionId)) {
          // Insert in the correct position based on SECTION_ORDER
          const position = SECTION_ORDER.indexOf(sectionId);
          // Find where to insert - after the last enabled section before this position
          let insertIndex = newOrder.length;
          for (let i = 0; i < newOrder.length; i++) {
            const pos = SECTION_ORDER.indexOf(newOrder[i] as ToggleableSection);
            if (pos < position) {
              insertIndex = i + 1;
            }
          }
          newOrder.splice(insertIndex, 0, sectionId);
        }
      } else {
        // Remove section
        newOrder = newOrder.filter(id => id !== sectionId);
      }
      
      return { ...prev, sectionOrder: newOrder };
    });
  }

  function getSectionData(id: ToggleableSection): any {
    switch (id) {
      case "summary": return cv.summary;
      case "experience": return cv.experience;
      case "education": return cv.education;
      case "skills": return cv.skills;
      case "languages": return cv.languages;
      case "certificates": return cv.certificates;
      case "projects": return cv.projects;
      case "publications": return cv.publications;
      case "courses": return cv.courses;
      case "organizations": return cv.organizations;
      case "interests": return cv.interests;
      case "references": return cv.references;
      case "awards": return cv.awards;
      case "declaration": return cv.declaration;
      case "custom": return cv.custom;
      default: return null;
    }
  }

  function setSectionData(id: ToggleableSection, data: any) {
    setCv((prev) => ({ ...prev, [id]: data }));
  }

  function renderSectionEditor(id: ToggleableSection) {
    const data = getSectionData(id);
    const label = SECTION_LABELS[id] || id;
    const description = getSectionDescription(id);
    const isRequired = isRequiredSection(id);

    // Don't render if section is not enabled
    if (!enabledSections.includes(id) && !isRequired) return null;

    // Check if this section should be open by default
    const isOpen = open[id] ?? false;

    return (
      <div key={id} className="border-b border-stone-200">
        <button
          onClick={() => toggle(id)}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-stone-100"
        >
          <div>
            <span className="font-display text-sm font-bold tracking-tightish text-ink">
              {label}
            </span>
            {description && (
              <p className="text-xs text-stone-400 mt-0.5">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRequired && (
              <span className="text-xs text-stone-400">Required</span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-stone-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              strokeWidth={2}
            />
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-stone-200 bg-white px-4 py-4">
            {id === "summary" && (
              <TextArea
                label=""
                rows={4}
                value={data || ""}
                placeholder="Add a short summary of your key strengths, experience, and career goals..."
                onChange={(v) => setSectionData(id, v)}
              />
            )}
            {id === "experience" && (
              <ExperienceEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
                bulletStyle={bulletStyle}
                bulletSpacing={bulletSpacing}
                onBulletStyleChange={onBulletStyleChange}
                onBulletSpacingChange={onBulletSpacingChange}
              />
            )}
            {id === "education" && (
              <EducationEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "skills" && (
              <SkillsEditor
                skills={data}
                onChange={(skills) => setSectionData(id, skills)}
              />
            )}
            {id === "languages" && (
              <LanguagesEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "certificates" && (
              <CertificatesEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "projects" && (
              <ProjectsEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "publications" && (
              <PublicationsEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "courses" && (
              <CoursesEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "organizations" && (
              <OrganizationsEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "interests" && (
              <InterestsEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "references" && (
              <ReferencesEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "awards" && (
              <AwardsEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "declaration" && (
              <DeclarationEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
            {id === "custom" && (
              <CustomSectionEditor
                items={data}
                onChange={(items) => setSectionData(id, items)}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Clear all contents confirmation
  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    setCv((prev) => ({
      ...prev,
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certificates: [],
      projects: [],
      publications: [],
      courses: [],
      organizations: [],
      interests: [],
      references: [],
      awards: [],
      declaration: [],
      custom: [],
      sectionOrder: DEFAULT_SECTION_ORDER,
    }));
    setShowClearConfirm(false);
  };

  return (
    <div className="border-t border-stone-200">
      {/* Personal Details - Always shown */}
      <div className="border-b border-stone-200">
        <button
          onClick={() => toggle("personal")}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-stone-100"
        >
          <span className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-rust" strokeWidth={1.75} />
            <span className="font-display text-sm font-bold tracking-tightish text-ink">
              Personal Details
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-stone-400 transition-transform ${
              open.personal ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        </button>

        {open.personal && (
          <div className="border-t border-stone-200 bg-white px-4 py-4">
            <div className="space-y-3">
              <Field
                label="Full name"
                value={cv.fullName}
                placeholder="e.g., Maya Okafor, John Smith"
                onChange={(v) => setCv((prev) => ({ ...prev, fullName: v }))}
              />
              <Field
                label="Professional title"
                value={cv.title}
                placeholder="e.g., Senior Product Designer, Full Stack Developer"
                onChange={(v) => setCv((prev) => ({ ...prev, title: v }))}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <Field
                  label="Email"
                  type="email"
                  value={cv.email}
                  placeholder="e.g., maya@email.com"
                  onChange={(v) => setCv((prev) => ({ ...prev, email: v }))}
                />
                <Field
                  label="Phone"
                  value={cv.phone}
                  placeholder="e.g., +44 7700 900 321"
                  onChange={(v) => setCv((prev) => ({ ...prev, phone: v }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field
                  label="Location"
                  value={cv.location}
                  placeholder="e.g., London, UK"
                  onChange={(v) => setCv((prev) => ({ ...prev, location: v }))}
                />
                <Field
                  label="Website"
                  value={cv.website}
                  placeholder="e.g., maya.design"
                  onChange={(v) => setCv((prev) => ({ ...prev, website: v }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Sections */}
      {SECTION_ORDER.map((id) => renderSectionEditor(id))}

      {/* Add Content Button */}
      <div className="border-b border-stone-200 p-4">
        <button
          onClick={() => setShowSectionManager(true)}
          className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-rust bg-rust/5 py-3 text-sm font-semibold text-rust transition-colors hover:bg-rust/10"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Content
        </button>
      </div>

      {/* Clear All Button */}
      <div className="p-4">
        <button
          onClick={handleClearAll}
          className="flex w-full items-center justify-center gap-2 rounded border border-red-300 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          Clear All Contents
        </button>
      </div>

      {/* Section Manager Modal */}
      <SectionManager
        isOpen={showSectionManager}
        onClose={() => setShowSectionManager(false)}
        enabledSections={enabledSections}
        onToggleSection={toggleSection}
      />

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  Clear All Contents?
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  This action cannot be undone. All your CV data will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:border-stone-900 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}